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
  const [theme, setThemeState] = useState<OperationsTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    setThemeState(initialTheme);
    applyDocumentTheme(initialTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyDocumentTheme(theme);
  }, [ready, theme]);

  const setTheme = useCallback((nextTheme: OperationsTheme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyDocumentTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  const resolvedTheme = ready ? theme : "light";

  return (
    <OperationsThemeContext.Provider value={value}>
      <div
        className={`operations-theme operations-${resolvedTheme} h-full min-h-0`}
        data-operations-theme={resolvedTheme}
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
