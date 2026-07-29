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
import { createUserProfile, subscribeToUserProfile } from "@/services/usersService";
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
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribeAuth;
  }, []);

  // Real-time role/blocked detection from the user's Firestore profile.
  // Defaults to "player" if the profile hasn't loaded yet or Firestore
  // is unreachable, so the app degrades to the safer, lower-privilege
  // state rather than silently granting admin access.
  useEffect(() => {
    if (!user) {
      setRole(null);
      setBlocked(false);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const unsubscribeProfile = subscribeToUserProfile(user.uid, (profile) => {
      setRole(profile?.role ?? "player");
      setBlocked(profile?.blocked ?? false);
      setRoleLoading(false);
    });
    return unsubscribeProfile;
  }, [user]);

  async function login(email: string, password: string) {
    await loginWithEmail(email, password);
  }

  async function signup(displayName: string, email: string, password: string) {
    const firebaseUser = await signupWithEmail(displayName, email, password);
    // Seed the Firestore profile + wallet doc. This is infrastructure
    // only — no deposit/withdraw logic lives here (see WalletContext).
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
