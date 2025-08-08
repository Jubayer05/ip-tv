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
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return {
        success: true,
        user: userCredential.user,
        message:
          "Account created! Please check your email to verify your account.",
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

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        return {
          success: false,
          error:
            "Please verify your email before signing in. Check your inbox for the verification link.",
        };
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
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
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    verifyEmail,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
