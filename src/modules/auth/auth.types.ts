import type { AppLocale } from "@/i18n/config";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  businessId: string | null;
  role: string;
  preferredLanguage?: AppLocale;
  vertical?: string | null;
  timezone?: string | null;
};

export type AuthSessionResponse = {
  success: true;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
