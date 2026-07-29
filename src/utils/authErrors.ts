import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address isn't valid. Check it and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/user-not-found": "No account matches that email. Check the email or sign up.",
  "auth/wrong-password": "That password doesn't match. Try again or reset it.",
  "auth/invalid-credential": "Email or password is incorrect. Try again or reset your password.",
  "auth/email-already-in-use": "An account already exists with that email. Log in instead.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment before trying again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? "Something went wrong. Try again.";
  }
  return "Something went wrong. Try again.";
}
