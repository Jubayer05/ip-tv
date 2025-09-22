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
  const [authToken, setAuthToken] = useState(null);
  const [is2FAPending, setIs2FAPending] = useState(false);

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
            },
            freeTrial: result.data.freeTrial || {
              hasUsed: false,
              usedAt: null,
              trialData: null,
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

  // Generate JWT token for user
  const generateAuthToken = async (userData) => {
    try {
      const response = await fetch("/api/auth/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData._id,
          email: userData.email,
          role: userData.role,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAuthToken(result.token);
          // Store token in localStorage for persistence
          localStorage.setItem("authToken", result.token);
          return result.token;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating auth token:", error);
      return null;
    }
  };

  // Get stored auth token
  const getAuthToken = () => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return null;
    }
    return authToken || localStorage.getItem("authToken");
  };

  // Clear auth token
  const clearAuthToken = () => {
    setAuthToken(null);
    localStorage.removeItem("authToken");
  };

  // Refresh auth token
  const refreshAuthToken = async () => {
    if (user) {
      const newToken = await generateAuthToken(user);
      return newToken;
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const storedToken =
            typeof window !== "undefined"
              ? localStorage.getItem("authToken")
              : null;

          if (!storedToken) {
            setIs2FAPending(true);
            setUser(null);
            return;
          }

          const mongoUser = await fetchUserData(firebaseUser.email);

          if (mongoUser) {
            setIs2FAPending(false);
            setUser(mongoUser);
            setAuthToken(storedToken);
          } else {
            setIs2FAPending(false);
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
            setAuthToken(storedToken);
          }
        } else {
          setUser(null);
          setIs2FAPending(false);
          clearAuthToken();
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
        setIs2FAPending(false);
        clearAuthToken();
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
          // Generate auth token for the user
          await generateAuthToken(mongoUser);
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

  const login = async (email, password, recaptchaToken = null) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Always require 2FA - no need to check user settings
      return {
        success: true,
        user: userCredential.user,
        requires2FA: true,
        message: "2FA verification required",
      };
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
      clearAuthToken();
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

  const send2FACode = async (email) => {
    try {
      const response = await fetch("/api/auth/2fa/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: "Failed to send 2FA code" };
    }
  };

  const verify2FACode = async (email, code) => {
    try {
      const response = await fetch("/api/auth/2fa/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: "Failed to verify 2FA code" };
    }
  };

  const complete2FALogin = async (email) => {
    try {
      // Update last login in MongoDB
      await fetch(`/api/users/${email}/last-login`, {
        method: "PATCH",
      });

      // Fetch updated user data
      const mongoUser = await fetchUserData(email);
      if (mongoUser) {
        setUser(mongoUser);
        // Generate auth token for the user
        await generateAuthToken(mongoUser);
        setIs2FAPending(false);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to complete 2FA login" };
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

  const isAuthenticated = !!(user && getAuthToken());

  const setUserFromSocialLogin = async (userData, token) => {
    try {
      setUser(userData);
      setAuthToken(token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setIs2FAPending(false);
    } catch (error) {
      console.error("Error setting user from social login:", error);
    }
  };

  const value = {
    user,
    loading,
    authToken,
    hasAdminAccess,
    isSuperAdminUser,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    refreshUserData,
    send2FACode,
    verify2FACode,
    complete2FALogin,
    generateAuthToken,
    getAuthToken,
    refreshAuthToken,
    setUserFromSocialLogin,
    is2FAPending,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
