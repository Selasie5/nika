import { auth, onAuthStateChanged, User } from "@/config/firebase.config";
import {
  AuthError,
  logOut,
  signInWithEmail,
  signUpWithEmail,
} from "@/services/auth.service";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error: AuthError | null }>;
  signOut: () => Promise<{ success: boolean; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const result = await signUpWithEmail(email, password);
    if (result.user) {
      return { success: true, error: null };
    }
    return { success: false, error: result.error };
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    if (result.user) {
      return { success: true, error: null };
    }
    return { success: false, error: result.error };
  };

  const handleSignOut = async () => {
    const result = await logOut();
    if (!result.error) {
      return { success: true, error: null };
    }
    return { success: false, error: result.error };
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
