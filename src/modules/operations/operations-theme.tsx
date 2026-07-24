"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export { getOperationsAccent, OPERATIONS_ACCENTS } from "./operations-accents";

type OperationsTheme = "light" | "dark";

type OperationsThemeContextValue = {
  theme: OperationsTheme;
  setTheme: (theme: OperationsTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "hgezli-operations-theme";

const OperationsThemeContext =
  createContext<OperationsThemeContextValue | null>(null);

function resolveInitialTheme(): OperationsTheme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function OperationsThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<OperationsTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(resolveInitialTheme());
    setReady(true);
  }, []);

  const setTheme = useCallback((nextTheme: OperationsTheme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <OperationsThemeContext.Provider value={value}>
      <div
        className={`operations-theme ${
          ready && theme === "dark" ? "operations-dark" : "operations-light"
        }`}
        data-operations-theme={ready ? theme : "light"}
      >
        {children}
      </div>
    </OperationsThemeContext.Provider>
  );
}

export function useOperationsTheme() {
  const context = useContext(OperationsThemeContext);
  if (!context) {
    throw new Error(
      "useOperationsTheme must be used inside OperationsThemeProvider",
    );
  }
  return context;
}
