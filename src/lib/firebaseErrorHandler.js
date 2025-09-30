/**
 * Firebase Error Handler Utility
 * Converts Firebase authentication errors to user-friendly messages
 */

export const getFirebaseErrorMessage = (error) => {
  // Handle Firebase Auth errors
  if (error?.code) {
    switch (error.code) {
      // Authentication errors
      case "auth/email-already-in-use":
        return "This email address is already registered. Please try signing in or use a different email.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or create a new account.";

      case "auth/wrong-password":
        return "Incorrect password. Please try again.";

      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";

      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password with at least 6 characters.";

      case "auth/user-disabled":
        return "This account has been disabled. Please contact support for assistance.";

      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later or reset your password.";

      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email but different sign-in method. Please try signing in with the original method.";

      case "auth/credential-already-in-use":
        return "This credential is already associated with a different user account.";

      case "auth/invalid-verification-code":
        return "Invalid verification code. Please check the code and try again.";

      case "auth/invalid-verification-id":
        return "Invalid verification ID. Please request a new verification code.";

      case "auth/code-expired":
        return "Verification code has expired. Please request a new one.";

      case "auth/missing-verification-code":
        return "Please enter the verification code.";

      case "auth/missing-verification-id":
        return "Verification ID is missing. Please request a new verification code.";

      // Network errors
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";

      case "auth/timeout":
        return "Request timed out. Please try again.";

      // ReCAPTCHA errors
      case "auth/captcha-check-failed":
        return "reCAPTCHA verification failed. Please try again.";

      case "auth/invalid-captcha-response":
        return "Invalid reCAPTCHA response. Please complete the verification again.";

      // App verification errors
      case "auth/app-not-authorized":
        return "This app is not authorized to use Firebase Authentication.";

      case "auth/keychain-error":
        return "Keychain error. Please try again.";

      // Phone authentication errors
      case "auth/invalid-phone-number":
        return "Please enter a valid phone number.";

      case "auth/missing-phone-number":
        return "Phone number is required.";

      case "auth/quota-exceeded":
        return "SMS quota exceeded. Please try again later.";

      // Social login errors
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed. Please try again.";

      case "auth/popup-blocked":
        return "Sign-in popup was blocked by your browser. Please allow popups and try again.";

      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";

      case "auth/web-storage-unsupported":
        return "Web storage is not supported in this browser. Please use a different browser.";

      // Generic errors
      case "auth/internal-error":
        return "An internal error occurred. Please try again later.";

      case "auth/unauthorized-domain":
        return "This domain is not authorized for Firebase Authentication.";

      default:
        // For unknown Firebase errors, return a generic message
        return "Authentication failed. Please try again.";
    }
  }

  // Handle non-Firebase errors
  if (error?.message) {
    // Check for common error patterns
    if (error.message.includes("email")) {
      return "Please enter a valid email address.";
    }
    if (error.message.includes("password")) {
      return "Please check your password and try again.";
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Network error. Please check your internet connection and try again.";
    }

    // Return the original message for other cases
    return error.message;
  }

  // Fallback for completely unknown errors
  return "An unexpected error occurred. Please try again.";
};

/**
 * Get user-friendly error message for specific error types
 */
export const getCustomErrorMessage = (errorType, context = {}) => {
  const { email, provider } = context;

  switch (errorType) {
    case "EMAIL_ALREADY_EXISTS":
      return `An account with ${email} already exists. Please sign in or use a different email.`;

    case "SOCIAL_LOGIN_FAILED":
      return `Failed to sign in with ${provider}. Please try again or use a different method.`;

    case "ACCOUNT_CREATION_FAILED":
      return "Failed to create your account. Please try again.";

    case "VERIFICATION_FAILED":
      return "Email verification failed. Please check your email and try again.";

    case "PASSWORD_RESET_FAILED":
      return "Failed to send password reset email. Please try again.";

    case "INVALID_CREDENTIALS":
      return "Invalid email or password. Please check your credentials and try again.";

    case "ACCOUNT_DISABLED":
      return "Your account has been disabled. Please contact support for assistance.";

    case "TOO_MANY_ATTEMPTS":
      return "Too many failed attempts. Please wait a few minutes before trying again.";

    case "NETWORK_ERROR":
      return "Network error. Please check your internet connection and try again.";

    case "UNKNOWN_ERROR":
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Check if error is a Firebase error
 */
export const isFirebaseError = (error) => {
  return error?.code && error.code.startsWith("auth/");
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error) => {
  if (isFirebaseError(error)) {
    const criticalErrors = [
      "auth/user-disabled",
      "auth/account-exists-with-different-credential",
      "auth/credential-already-in-use",
      "auth/app-not-authorized",
    ];

    const warningErrors = [
      "auth/too-many-requests",
      "auth/weak-password",
      "auth/invalid-email",
      "auth/popup-blocked",
    ];

    if (criticalErrors.includes(error.code)) {
      return "critical";
    } else if (warningErrors.includes(error.code)) {
      return "warning";
    }
  }

  return "error";
};
