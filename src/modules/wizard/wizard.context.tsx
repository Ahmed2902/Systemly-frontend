"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { WizardState } from "./wizard.types";

const DRAFT_STORAGE_KEY = "hgezli:onboarding-draft:v1";

const initialState: WizardState = {
  vertical: null,
  template: "aura-wellness",
  name: "",
  slug: "",
  phone: "",
  city: "",
  address: "",
  services: [],
  staff: [],
  tagline: "",
  aboutText: "",
  heroPhotoUrl: null,
  logoUrl: null,
  galleryPhotoUrls: [],
  primaryColor: "#0E6B4D",
  sectionOrder: ["hero", "about", "services", "gallery", "team", "contact", "faq"],
  showTeam: true,
  showFaq: true,
  instagram: "",
  whatsapp: "",
  faqs: [],
};

type Action =
  | { type: "PATCH"; payload: Partial<WizardState> }
  | { type: "RESTORE"; payload: WizardState }
  | { type: "RESET" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    case "RESTORE":
      return { ...initialState, ...action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  patch: (payload: Partial<WizardState>) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  draftReady: boolean;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) dispatch({ type: "RESTORE", payload: JSON.parse(stored) as WizardState });
    } catch (error) {
      console.warn("Unable to restore onboarding draft", error);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn("Unable to save onboarding draft", error);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftReady, state]);

  const value = useMemo(
    () => ({
      state,
      patch: (payload: Partial<WizardState>) => dispatch({ type: "PATCH", payload }),
      saveDraft: () => window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state)),
      clearDraft: () => {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        dispatch({ type: "RESET" });
      },
      draftReady,
    }),
    [draftReady, state],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard must be used within WizardProvider");
  return context;
}
