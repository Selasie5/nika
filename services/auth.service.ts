import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "@/config/firebase.config";

export interface AuthError {
  code: string;
  message: string;
}

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      } as AuthError,
    };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      } as AuthError,
    };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return {
      error: {
        code: error.code,
        message: getErrorMessage(error.code),
      } as AuthError,
    };
  }
};
