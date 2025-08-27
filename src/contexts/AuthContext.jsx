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
  const [loading, setLoading] = useState(true);

  // Check if user is super admin
  const isSuperAdmin = (email) => {
    return email === "jubayer0504@gmail.com";
  };

  // Check if user has admin privileges
  const hasAdminAccess = () => {
    return user?.role === "admin" || isSuperAdmin(user?.email);
  };

  // Check if user is super admin
  const isSuperAdminUser = () => {
    return isSuperAdmin(user?.email);
  };

  // Fetch MongoDB user data
  const fetchUserData = async (email) => {
    try {
      const response = await fetch(
        `/api/users/profile?email=${encodeURIComponent(email)}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Transform the data to match our expected structure
          return {
            _id: result.data._id, // MongoDB document ID
            email: result.data.email,
            role: result.data.role,
            profile: {
              firstName: result.data.firstName,
              lastName: result.data.lastName,
              username: result.data.username,
              avatar: result.data.avatar,
              dateOfBirth: result.data.dateOfBirth,
              country: result.data.country,
              phone: result.data.phone,
            },
            // Add other fields that might be available
            balance: result.data.balance || 0,
            rank: result.data.rank || {
              level: "bronze",
              totalSpent: 0,
              discountPercentage: 5,
            },
            referral: result.data.referral || {
              code: null,
              referredBy: null,
              earnings: 0,
            },
            settings: result.data.settings || {
              notifications: true,
              twoFactorEnabled: false,
            },
            isActive: result.data.isActive !== false,
            lastLogin: result.data.lastLogin,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch MongoDB user data instead of storing Firebase user
          const mongoUser = await fetchUserData(firebaseUser.email);

          if (mongoUser) {
            // Set MongoDB user data as the main user state
            setUser(mongoUser);
          } else {
            // If no MongoDB user found, create a minimal user object
            setUser({
              email: firebaseUser.email,
              role: isSuperAdmin(firebaseUser.email) ? "admin" : "user",
              profile: {
                firstName: firebaseUser.displayName?.split(" ")[0] || "",
                lastName:
                  firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
                username: firebaseUser.displayName || "",
                avatar: firebaseUser.photoURL || "",
              },
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
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

        // Fetch the newly created user data
        const mongoUser = await fetchUserData(email);
        if (mongoUser) {
          setUser(mongoUser);
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

      // Fetch updated user data after login
      const mongoUser = await fetchUserData(email);
      if (mongoUser) {
        setUser(mongoUser);
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
      setUser(null);
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

  // Function to refresh user data (useful for profile updates)
  const refreshUserData = async () => {
    if (user?.email) {
      const mongoUser = await fetchUserData(user.email);
      if (mongoUser) {
        setUser(mongoUser);
      }
    }
  };

  const value = {
    user,
    loading,
    hasAdminAccess,
    isSuperAdminUser,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
