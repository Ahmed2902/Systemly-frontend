// src/modules/wizard/wizard.context.tsx
"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { WizardState } from "./wizard.types";

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
  galleryPhotoUrls: [],
  primaryColor: "#2B2420",
  sectionOrder: [
    "hero",
    "about",
    "services",
    "gallery",
    "team",
    "contact",
    "faq",
  ],
  showTeam: true,
  showFaq: true,
  instagram: "",
  whatsapp: "",

  faqs: [],
};

type Action = { type: "PATCH"; payload: Partial<WizardState> };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  patch: (payload: Partial<WizardState>) => void;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const patch = (payload: Partial<WizardState>) =>
    dispatch({ type: "PATCH", payload });

  return (
    <WizardContext.Provider value={{ state, patch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
