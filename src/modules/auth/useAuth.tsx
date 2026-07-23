"use client";

import {
  createContext,
  useContext,
  useEffect,
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
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getAccessToken(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeAccessToken(setAccessToken), []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // Access tokens intentionally live in memory. A full browser reload needs
        // one refresh-cookie exchange; client-side page navigation does not.
        const refreshed = await refreshAccessToken();
        const token = refreshed.data.accessToken;
        const currentUser = await api<User>("/auth/me", token, {}, {
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
  }, []);

  async function logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearSession();
    }
  }

  function setSession(nextUser: User, token: string) {
    setUser(nextUser);
    storeAccessToken(token);
  }

  function clearSession() {
    setUser(null);
    storeAccessToken(null);
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
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
