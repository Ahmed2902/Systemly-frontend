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

export type OperationsTheme = "light" | "dark";

type OperationsThemeContextValue = {
  theme: OperationsTheme;
  setTheme: (theme: OperationsTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "systemly-operations-theme";
const LEGACY_STORAGE_KEY = "hgezli-operations-theme";
const OperationsThemeContext =
  createContext<OperationsThemeContextValue | null>(null);

function isTheme(value: string | null): value is OperationsTheme {
  return value === "light" || value === "dark";
}

function resolveInitialTheme(): OperationsTheme {
  if (typeof window === "undefined") return "light";

  const fromDocument = document.documentElement.dataset.operationsTheme;
  if (isTheme(fromDocument ?? null)) return fromDocument;

  const stored =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (isTheme(stored)) return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyDocumentTheme(theme: OperationsTheme) {
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === "dark";

  root.dataset.operationsTheme = theme;
  root.classList.toggle("operations-dark", isDark);
  root.classList.toggle("operations-light", !isDark);
  root.style.colorScheme = theme;

  body.dataset.operationsTheme = theme;
  body.classList.toggle("operations-dark", isDark);
  body.classList.toggle("operations-light", !isDark);
}

export function OperationsThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<OperationsTheme>(resolveInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    applyDocumentTheme(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: OperationsTheme) => {
    setThemeState(nextTheme);
    applyDocumentTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <OperationsThemeContext.Provider value={value}>
      <div
        className={`operations-theme operations-${theme} h-full min-h-0`}
        data-operations-theme={theme}
        suppressHydrationWarning
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
