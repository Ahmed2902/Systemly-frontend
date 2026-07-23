"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/shared/lib/api";
import { logoutUser, refreshAccessToken } from "./auth.api";
import {
  getAccessToken,
  setAccessToken as storeAccessToken,
  subscribeAccessToken,
} from "./auth.store";
import type { AuthUser } from "./auth.types";

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getAccessToken(),
  );
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    storeAccessToken(null);
  }, []);

  const setSession = useCallback((nextUser: AuthUser, token: string) => {
    setUser(nextUser);
    storeAccessToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => subscribeAccessToken(setAccessToken), []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // A full browser reload clears the in-memory access token, so restore the
        // session once from the refresh cookie. Client-side navigation and Fast
        // Refresh reuse the existing token instead of rotating the cookie again.
        const existingToken = getAccessToken();
        const token = existingToken ?? (await refreshAccessToken()).data.accessToken;
        const currentUser = await api<AuthUser>("/auth/me", token, {}, {
          retryOnUnauthorized: false,
        });
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  useEffect(() => {
    if (!loading && user && !accessToken) setUser(null);
  }, [accessToken, loading, user]);

  const value = useMemo(
    () => ({ user, accessToken, loading, setSession, clearSession, logout }),
    [user, accessToken, loading, setSession, clearSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
