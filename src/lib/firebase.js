// Lazy Firebase initialization to reduce main thread blocking
let app;
let auth;
let googleProvider;
let facebookProvider;
let twitterProvider;
let isInitialized = false;
let initPromise = null;

// Lazy initialization function - only runs when auth is actually needed
const initializeFirebase = async () => {
  if (isInitialized) return auth;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      auth = createMockAuth();
      isInitialized = true;
      return auth;
    }

    try {
      // Dynamic imports to reduce initial bundle parse time
      const [{ initializeApp }, { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider }] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
      ]);

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);

      // Initialize social auth providers
      googleProvider = new GoogleAuthProvider();
      facebookProvider = new FacebookAuthProvider();
      twitterProvider = new TwitterAuthProvider();

      // Add scopes
      googleProvider.addScope("email");
      googleProvider.addScope("profile");
      facebookProvider.addScope("email");
      twitterProvider.addScope("email");

      isInitialized = true;
      return auth;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      auth = createMockAuth();
      isInitialized = true;
      return auth;
    }
  })();

  return initPromise;
};

// Initialize immediately in browser but don't block
if (typeof window !== "undefined") {
  // Use requestIdleCallback to initialize during idle time
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initializeFirebase(), { timeout: 2000 });
  } else {
    setTimeout(() => initializeFirebase(), 100);
  }
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

// Helper to get auth - ensures Firebase is initialized
export const getFirebaseAuth = async () => {
  await initializeFirebase();
  return auth;
};

// Social auth functions - now async to ensure Firebase is ready
export const signInWithGoogle = async () => {
  await initializeFirebase();
  if (!auth || !googleProvider) {
    throw new Error("Firebase not configured");
  }
  const { signInWithPopup } = await import("firebase/auth");
  return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = async () => {
  await initializeFirebase();
  if (!auth || !facebookProvider) {
    throw new Error("Firebase not configured");
  }
  const { signInWithPopup } = await import("firebase/auth");
  return signInWithPopup(auth, facebookProvider);
};

export const signInWithTwitter = async () => {
  await initializeFirebase();
  if (!auth || !twitterProvider) {
    throw new Error("Firebase not configured");
  }
  const { signInWithRedirect } = await import("firebase/auth");
  return signInWithRedirect(auth, twitterProvider);
};

export const getTwitterRedirectResult = async () => {
  await initializeFirebase();
  if (!auth) {
    throw new Error("Firebase not configured");
  }
  const { getRedirectResult } = await import("firebase/auth");
  return getRedirectResult(auth);
};

// Export getter for auth (for backward compatibility)
// Note: This may be undefined until initializeFirebase() completes
export { auth, facebookProvider, googleProvider, twitterProvider, initializeFirebase };
