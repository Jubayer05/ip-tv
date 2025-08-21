"use client";
import { auth } from "@/lib/firebase";
import {
  applyActionCode,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is super admin
  const isSuperAdmin = (email) => {
    return email === "jubayer0504@gmail.com";
  };

  // Check if user has admin privileges
  const hasAdminAccess = () => {
    return (
      userRole === "admin" ||
      userRole === "support" ||
      isSuperAdmin(user?.email)
    );
  };

  // Check if user is super admin
  const isSuperAdminUser = () => {
    return isSuperAdmin(user?.email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Fetch user role from MongoDB using email (since documents don't have firebaseUid)
          try {
            const response = await fetch(
              `/api/users/${firebaseUser.email}/role`
            );

            if (response.ok) {
              const data = await response.json();
              setUserRole(data.role);
            } else {
              // If no role found, set default role
              setUserRole("user");
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole("user");
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        // Handle Firebase auth errors gracefully
        console.error("Firebase auth error:", error);

        // Provide custom error messages instead of Firebase technical errors
        if (error.code === "auth/invalid-credential") {
          console.error("Authentication failed: Invalid credentials");
        } else if (error.code === "auth/user-not-found") {
          console.error("Authentication failed: User not found");
        } else if (error.code === "auth/network-request-failed") {
          console.error("Authentication failed: Network error");
        } else {
          console.error("Authentication failed: Unknown error");
        }

        // Clear user state on error
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (
    email,
    password,
    firstName,
    lastName,
    userName,
    options = {}
  ) => {
    const { skipDb = false } = options;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // Create user in MongoDB (unless explicitly skipped for verify flow)
      if (!skipDb) {
        const role = isSuperAdmin(email) ? "admin" : "user";
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUid: userCredential.user.uid,
            email: email,
            profile: {
              firstName: firstName,
              lastName: lastName,
              username: userName,
            },
            role: role,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create user in database");
        }
      }

      return {
        success: true,
        user: userCredential.user,
        message: "Account created successfully!",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update last login in MongoDB using email
      try {
        await fetch(`/api/users/${userCredential.user.email}/last-login`, {
          method: "PATCH",
        });
      } catch (error) {
        console.error("Error updating last login:", error);
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      // Provide custom error messages instead of Firebase technical errors
      let customError = "Login failed. Please try again.";

      if (error.code === "auth/invalid-credential") {
        customError =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.code === "auth/user-not-found") {
        customError =
          "No account found with this email address. Please check your email or create a new account.";
      } else if (error.code === "auth/wrong-password") {
        customError = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        customError = "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        customError =
          "Network error. Please check your internet connection and try again.";
      } else if (error.code === "auth/user-disabled") {
        customError = "This account has been disabled. Please contact support.";
      }

      return { success: false, error: customError };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: "No user found" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (actionCode) => {
    try {
      await applyActionCode(auth, actionCode);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userRole,
    hasAdminAccess,
    isSuperAdminUser,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
