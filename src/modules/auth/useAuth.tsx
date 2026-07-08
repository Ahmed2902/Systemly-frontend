// src/modules/auth/useAuth.ts
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiUrl } from "@/shared/lib/api-url";
import { logoutUser, refreshAccessToken } from "./auth.api";

type User = {
  id: string;
  name: string;
  email: string;
  businessId: string | null;
  role: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // useAuth.ts bootstrap effect
  useEffect(() => {
    fetch(apiUrl("/auth/me"), { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.data) setUser(res.data); // <- was res.data.user
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // inside AuthProvider, alongside the bootstrap effect
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshAccessToken().catch(() => {
          // refresh failed — token likely expired, force logout
          clearSession();
        });
      },
      13 * 60 * 1000,
    ); // slightly before the 15-minute expiry

    return () => clearInterval(interval);
  }, []);

  async function logout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearSession();
    }
  }

  function setSession(user: User, accessToken: string) {
    setUser(user);
    setAccessToken(accessToken);
  }

  function clearSession() {
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, setSession, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
