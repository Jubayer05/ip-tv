import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  TwitterAuthProvider,
} from "firebase/auth";

let app;
let auth;
let googleProvider;
let facebookProvider;
let twitterProvider;

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

    // Initialize social auth providers
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    twitterProvider = new TwitterAuthProvider();

    // Add scopes if needed
    googleProvider.addScope("email");
    googleProvider.addScope("profile");
    facebookProvider.addScope("email");
    twitterProvider.addScope("email");
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

// Social auth functions
export const signInWithGoogle = () => {
  if (!auth || !googleProvider) {
    throw new Error("Firebase not configured");
  }
  return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = () => {
  if (!auth || !facebookProvider) {
    throw new Error("Firebase not configured");
  }
  return signInWithPopup(auth, facebookProvider);
};

export const signInWithTwitter = () => {
  if (!auth || !twitterProvider) {
    throw new Error("Firebase not configured");
  }
  return signInWithRedirect(auth, twitterProvider);
};

export const getTwitterRedirectResult = () => {
  if (!auth) {
    throw new Error("Firebase not configured");
  }
  return getRedirectResult(auth);
};

export { auth, facebookProvider, googleProvider, twitterProvider };
