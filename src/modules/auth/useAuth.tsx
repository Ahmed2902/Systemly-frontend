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
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { api } from "@/shared/lib/api";
import { logoutUser, refreshAccessToken } from "./auth.api";
import {
  getAccessToken,
  setAccessToken as storeAccessToken,
  subscribeAccessToken,
} from "./auth.store";
import type { AuthUser } from "./auth.types";

export type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AuthOverrideContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skipRemoteBootstrap = pathname?.startsWith("/demo/operations/") ?? false;
  const { locale, setLocale } = useLocale();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getAccessToken(),
  );
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    storeAccessToken(null);
  }, []);

  const syncUserLocale = useCallback(
    (nextUser: AuthUser) => {
      if (
        nextUser.preferredLanguage &&
        nextUser.preferredLanguage !== locale
      ) {
        setLocale(nextUser.preferredLanguage);
        return true;
      }
      return false;
    },
    [locale, setLocale],
  );

  const setSession = useCallback(
    (nextUser: AuthUser, token: string) => {
      setUser(nextUser);
      storeAccessToken(token);
      syncUserLocale(nextUser);
    },
    [syncUserLocale],
  );

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
    if (skipRemoteBootstrap) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function bootstrap() {
      try {
        const existingToken = getAccessToken();
        const token = existingToken ?? (await refreshAccessToken()).data.accessToken;
        const currentUser = await api<AuthUser>("/auth/me", token, {}, {
          retryOnUnauthorized: false,
        });
        if (!cancelled) {
          setUser(currentUser);
          syncUserLocale(currentUser);
        }
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
  }, [clearSession, skipRemoteBootstrap, syncUserLocale]);

  useEffect(() => {
    if (!loading && user && !accessToken && !skipRemoteBootstrap) setUser(null);
  }, [accessToken, loading, skipRemoteBootstrap, user]);

  const value = useMemo(
    () => ({ user, accessToken, loading, setSession, clearSession, logout }),
    [user, accessToken, loading, setSession, clearSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthOverrideProvider({
  user,
  accessToken,
  children,
}: {
  user: AuthUser;
  accessToken: string;
  children: ReactNode;
}) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading: false,
      setSession: () => undefined,
      clearSession: () => undefined,
      logout: async () => undefined,
    }),
    [accessToken, user],
  );

  return (
    <AuthOverrideContext.Provider value={value}>
      {children}
    </AuthOverrideContext.Provider>
  );
}

export function useAuth() {
  const override = useContext(AuthOverrideContext);
  const context = useContext(AuthContext);
  if (override) return override;
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
