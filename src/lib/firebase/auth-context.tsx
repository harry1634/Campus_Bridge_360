"use client";

import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./client";
import type { UserRole } from "@/lib/types";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? ((userDoc.data().role as UserRole) ?? null) : null;
      setState({ user, role, loading: false });
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
