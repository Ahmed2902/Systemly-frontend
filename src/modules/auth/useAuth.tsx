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
  vertical?: string | null;
  timezone?: string | null;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCurrentUser(token: string) {
      const res = await fetch(apiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Unable to load current user");

      const json = await res.json();
      return json?.data ?? null;
    }

    async function bootstrap() {
      try {
        const refreshed = await refreshAccessToken();
        if (cancelled) return;

        const nextToken = refreshed?.data?.accessToken;
        if (!nextToken) return;

        setAccessToken(nextToken);

        const currentUser = await fetchCurrentUser(nextToken);
        if (cancelled || !currentUser) return;

        setUser(currentUser);
      } catch {
        // No active session: stay signed out without surfacing a noisy auth error.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  // inside AuthProvider, alongside the bootstrap effect
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(
      () => {
        refreshAccessToken()
          .then((res) => {
            const nextToken = res?.data?.accessToken;
            if (nextToken) setAccessToken(nextToken);
          })
          .catch(() => {
            // refresh failed — token likely expired, force logout
            clearSession();
          });
      },
      13 * 60 * 1000,
    ); // slightly before the 15-minute expiry

    return () => clearInterval(interval);
  }, [user]);

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
      value={{ user, accessToken, loading, setSession, clearSession, logout }}
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
