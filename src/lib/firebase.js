import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let app;
let auth;

// Only initialize Firebase if we're in the browser and have valid config
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    auth = createMockAuth();
  }
} else {
  // During build time or when config is missing, use mock auth
  auth = createMockAuth();
}

function createMockAuth() {
  return {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not configured")),
    createUserWithEmailAndPassword: () =>
      Promise.reject(new Error("Firebase not configured")),
    signOut: () => Promise.reject(new Error("Firebase not configured")),
    sendPasswordResetEmail: () =>
      Promise.reject(new Error("Firebase not configured")),
    sendEmailVerification: () =>
      Promise.reject(new Error("Firebase not configured")),
    updateProfile: () => Promise.reject(new Error("Firebase not configured")),
    applyActionCode: () => Promise.reject(new Error("Firebase not configured")),
  };
}

export { auth };
