import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import {
  loginWithEmail,
  signupWithEmail,
  resetPasswordEmail,
  logoutUser,
} from "@/services/authService";
import {
  createUserProfile,
  subscribeToUserProfile,
} from "@/services/usersService";
import { ensureWalletDoc } from "@/services/walletsService";
import type { UserRole } from "@/types/firestore";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  roleLoading: boolean;
  blocked: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[Admin Debug] Auth user:", firebaseUser?.uid);
      console.log("[Admin Debug] Auth email:", firebaseUser?.email);

      setUser(firebaseUser);
      setInitializing(false);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) {
      console.log("[Admin Debug] No authenticated user");
      setRole(null);
      setBlocked(false);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);

    console.log(
      "[Admin Debug] Reading Firestore profile for UID:",
      user.uid
    );

    console.log(
      "[Admin Debug] Expected Firestore path:",
      `users/${user.uid}`
    );

    const unsubscribeProfile = subscribeToUserProfile(
      user.uid,
      (profile) => {
        console.log("[Admin Debug] Firestore profile:", profile);
        console.log("[Admin Debug] PROFILE NULL:", profile === null);
        console.log(
          "[Admin Debug] EXPECTED PATH:",
          `users/${user.uid}`
        );
        console.log("[Admin Debug] EXPECTED UID:", user.uid);
        console.log("[Admin Debug] Firestore role:", profile?.role);
        console.log("[Admin Debug] Firestore blocked:", profile?.blocked);

        if (profile === null) {
          console.error(
            "[Admin Debug] PROFILE NULL - Firestore profile not received"
          );
        } else {
          console.log("[Admin Debug] PROFILE FOUND");
        }

        setRole(profile?.role ?? null);
        setBlocked(profile?.blocked ?? false);
        setRoleLoading(false);
      }
    );

    return unsubscribeProfile;
  }, [user]);

  async function login(email: string, password: string) {
    await loginWithEmail(email, password);
  }

  async function signup(
    displayName: string,
    email: string,
    password: string
  ) {
    const firebaseUser = await signupWithEmail(
      displayName,
      email,
      password
    );

    await createUserProfile({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName,
      photoURL: firebaseUser.photoURL,
      role: "player",
      blocked: false,
      createdAt: new Date().toISOString(),
    });

    await ensureWalletDoc(firebaseUser.uid);
  }

  async function resetPassword(email: string) {
    await resetPasswordEmail(email);
  }

  async function logout() {
    await logoutUser();
  }

  const value: AuthContextValue = {
    user,
    role,
    roleLoading,
    blocked,
    initializing,
    login,
    signup,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
