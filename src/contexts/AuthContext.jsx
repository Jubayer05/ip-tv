"use client";
import { auth } from "@/lib/firebase";
import {
  getCustomErrorMessage,
  getFirebaseErrorMessage,
  isFirebaseError,
} from "@/lib/firebaseErrorHandler";
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
    const superAdminEmails = [
      "jubayer0504@gmail.com",
      "alan.sangasare10@gmail.com",
    ];
    return superAdminEmails.includes(email);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData._id,
          email: userData.email,
          role: userData.role,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const access = result.accessToken || result.token; // fallback if older API
          if (access) {
            setAuthToken(access);
            localStorage.setItem("authToken", access);
          }
          if (result.refreshToken) {
            localStorage.setItem("refreshToken", result.refreshToken);
          }
          return access;
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

  const isRsToken = (t) => {
    try {
      const header = JSON.parse(atob(t.split(".")[0]));
      return typeof header?.alg === "string" && header.alg.startsWith("RS");
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      const t =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;

      // If missing OR it's an RS256 token (Firebase ID token), replace it with our HS256 app token
      if (!t || isRsToken(t)) {
        const newToken = await generateAuthToken(user);
        if (newToken) {
          setAuthToken(newToken);
          localStorage.setItem("authToken", newToken);
        }
      }
    })();
  }, [user]);

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
      // Use custom error handler for Firebase errors
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("ACCOUNT_CREATION_FAILED", { email });

      return { success: false, error: customError };
    }
  };

  const login = async (
    email,
    password,
    recaptchaToken = null,
    visitorId = null
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Check if device is trusted when visitorId is provided
      let requires2FA = true;

      if (visitorId) {
        try {
          const response = await fetch("/api/auth/2fa/check-device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, visitorId }),
          });

          const data = await response.json();

          if (data.success && data.isTrusted) {
            // Device is trusted, skip 2FA
            requires2FA = false;

            // Complete login immediately
            await fetch(`/api/users/${email}/last-login`, { method: "PATCH" });
            const mongoUser = await fetchUserData(email);
            if (mongoUser) {
              setUser(mongoUser);
              await generateAuthToken(mongoUser);
              setIs2FAPending(false);
            }
          }
        } catch (error) {
          console.error("Device check failed:", error);
          // On error, require 2FA for security
          requires2FA = true;
        }
      }

      return {
        success: true,
        user: userCredential.user,
        requires2FA,
        message: requires2FA ? "2FA verification required" : "Login successful",
      };
    } catch (error) {
      // Use custom error handler for Firebase errors
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("INVALID_CREDENTIALS");

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
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("PASSWORD_RESET_FAILED");

      return { success: false, error: customError };
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
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("VERIFICATION_FAILED");

      return { success: false, error: customError };
    }
  };

  const verifyEmail = async (actionCode) => {
    try {
      await applyActionCode(auth, actionCode);
      return { success: true };
    } catch (error) {
      const customError = isFirebaseError(error)
        ? getFirebaseErrorMessage(error)
        : getCustomErrorMessage("VERIFICATION_FAILED");

      return { success: false, error: customError };
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

  const verify2FACode = async (
    email,
    code,
    visitorId = null,
    deviceInfo = null
  ) => {
    try {
      const response = await fetch("/api/auth/2fa/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, visitorId, deviceInfo }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: "Failed to verify 2FA code" };
    }
  };

  const complete2FALogin = async (email) => {
    try {
      await fetch(`/api/users/${email}/last-login`, { method: "PATCH" });

      const mongoUser = await fetchUserData(email);
      if (mongoUser) {
        setUser(mongoUser);
        // Try custom JWT first
        let token = await generateAuthToken(mongoUser);

        // Fallback: use Firebase ID token in production if JWT failed
        if (!token && typeof window !== "undefined" && auth?.currentUser) {
          token = await auth.currentUser.getIdToken();
          setAuthToken(token);
          localStorage.setItem("authToken", token);
        }

        setIs2FAPending(false);
        return { success: true, token };
      }

      return { success: false, error: "Failed to fetch user data" };
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
    getAuthToken, // Make sure this line is present
    refreshAuthToken,
    setUserFromSocialLogin,
    is2FAPending,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
