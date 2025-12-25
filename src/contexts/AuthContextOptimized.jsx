"use client";
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
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [superAdminEmails, setSuperAdminEmails] = useState([]);

  // Lazy load Firebase only when needed
  useEffect(() => {
    let unsubscribe;

    const loadFirebase = async () => {
      try {
        // Dynamically import Firebase
        const { auth } = await import("@/lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");

        setFirebaseLoaded(true);

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            setAuthToken(token);

            // Check super admin status using state
            const isSuperAdmin = (email) => {
              if (!email || superAdminEmails.length === 0) return false;
              return superAdminEmails.includes(email.toLowerCase().trim());
            };

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              isSuperAdmin: isSuperAdmin(firebaseUser.email || ""),
            });
          } else {
            setUser(null);
            setAuthToken(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Failed to load Firebase:", error);
        setLoading(false);
      }
    };

    loadFirebase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch super admin emails from API
  useEffect(() => {
    const fetchSuperAdminEmails = async () => {
      try {
        const token = authToken;
        if (token) {
          const response = await fetch("/api/admin/super-admins", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setSuperAdminEmails(data.emails || []);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch super admin emails:", error);
        // No fallback - keep empty array for security
        // Super admin check will fail if API is unavailable
        setSuperAdminEmails([]);
      }
    };

    if (authToken) {
      fetchSuperAdminEmails();
    }
  }, [authToken]);

  // Update user's super admin status when emails are loaded
  useEffect(() => {
    if (user && user.email && superAdminEmails.length > 0) {
      const isSuperAdmin = superAdminEmails.includes(
        user.email.toLowerCase().trim()
      );
      setUser((prevUser) => ({
        ...prevUser,
        isSuperAdmin: isSuperAdmin,
      }));
    }
  }, [superAdminEmails, user?.email]);

  // Lazy-loaded auth methods
  const signup = async (email, password, name) => {
    const { auth } = await import("@/lib/firebase");
    const {
      createUserWithEmailAndPassword,
      sendEmailVerification,
      updateProfile,
    } = await import("firebase/auth");
    const { getCustomErrorMessage } = await import(
      "@/lib/firebaseErrorHandler"
    );

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (name) {
        await updateProfile(user, { displayName: name });
      }

      await sendEmailVerification(user);
      return { success: true, user };
    } catch (error) {
      throw new Error(getCustomErrorMessage(error.code));
    }
  };

  const login = async (email, password) => {
    const { auth } = await import("@/lib/firebase");
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const { getFirebaseErrorMessage, isFirebaseError } = await import(
      "@/lib/firebaseErrorHandler"
    );

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      if (
        isFirebaseError(error) &&
        error.code === "auth/multi-factor-auth-required"
      ) {
        setIs2FAPending(true);
        throw error;
      }
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const logout = async () => {
    const { auth } = await import("@/lib/firebase");
    const { signOut } = await import("firebase/auth");

    try {
      await signOut(auth);
      setUser(null);
      setAuthToken(null);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    const { auth } = await import("@/lib/firebase");
    const { sendPasswordResetEmail } = await import("firebase/auth");

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (oobCode) => {
    const { auth } = await import("@/lib/firebase");
    const { applyActionCode } = await import("firebase/auth");

    try {
      await applyActionCode(auth, oobCode);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authToken,
    is2FAPending,
    firebaseLoaded,
    signup,
    login,
    logout,
    resetPassword,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
