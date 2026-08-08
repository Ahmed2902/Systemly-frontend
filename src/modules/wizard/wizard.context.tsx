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
import {
  getDefaultTemplateId,
  isTemplateValidForVertical,
} from "@/modules/templates/template-registry";
import { completePublicSectionOrder } from "@/modules/templates/section-order";
import type { WizardState } from "./wizard.types";

const DRAFT_STORAGE_KEY = "hgezli:onboarding-draft:v1";
const VERTICAL_DEFAULT_COLOURS = {
  salon: "#8C5A3C",
  clinic: "#1677B8",
} as const;

const initialState: WizardState = {
  vertical: null,
  template: "aura-wellness",
  name: "",
  slug: "",
  phone: "",
  city: "",
  address: "",
  timezone: "Africa/Cairo",
  language: "en",
  services: [],
  staff: [],
  tagline: "",
  heroDescription: "",
  heroCardText: "",
  aboutText: "",
  heroPhotoUrl: null,
  heroPhotoObjectPath: null,
  logoUrl: null,
  logoObjectPath: null,
  galleryPhotoUrls: [],
  galleryPhotoObjectPaths: [],
  primaryColor: VERTICAL_DEFAULT_COLOURS.salon,
  sectionOrder: completePublicSectionOrder([]),
  showTeam: true,
  showFaq: true,
  showServicePrices: true,
  instagram: "",
  whatsapp: "",
  faqs: [],
};

function normalizeState(value: Partial<WizardState>): WizardState {
  const merged = { ...initialState, ...value };
  const template =
    merged.vertical && isTemplateValidForVertical(merged.template, merged.vertical)
      ? merged.template
      : getDefaultTemplateId(merged.vertical);

  return {
    ...merged,
    template,
    services: merged.services.map((service) => ({
      ...service,
      priceEgp: Math.max(1, Number(service.priceEgp) || 1),
    })),
    sectionOrder: completePublicSectionOrder(merged.sectionOrder),
  };
}

type Action =
  | { type: "PATCH"; payload: Partial<WizardState> }
  | { type: "RESTORE"; payload: Partial<WizardState> }
  | { type: "RESET" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "PATCH": {
      const verticalChanged =
        action.payload.vertical && action.payload.vertical !== state.vertical;
      return normalizeState({
        ...state,
        ...action.payload,
        ...(verticalChanged
          ? {
              template: getDefaultTemplateId(action.payload.vertical ?? null),
              primaryColor:
                VERTICAL_DEFAULT_COLOURS[
                  action.payload.vertical as "salon" | "clinic"
                ],
              heroPhotoUrl: null,
              heroPhotoObjectPath: null,
              heroDescription: "",
              heroCardText: "",
            }
          : {}),
      });
    }
    case "RESTORE":
      return normalizeState(action.payload);
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
      if (stored) {
        dispatch({
          type: "RESTORE",
          payload: JSON.parse(stored) as Partial<WizardState>,
        });
      }
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
      patch: (payload: Partial<WizardState>) =>
        dispatch({ type: "PATCH", payload }),
      saveDraft: () =>
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state)),
      clearDraft: () => {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        dispatch({ type: "RESET" });
      },
      draftReady,
    }),
    [draftReady, state],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard must be used within WizardProvider");
  return context;
}
