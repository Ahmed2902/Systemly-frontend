import type { AppLocale } from "@/i18n/config";
import type { SubscriptionAccessSnapshot } from "@/modules/subscriptions/subscription-access";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  businessId: string | null;
  branchId?: string | null;
  role: string;
  preferredLanguage?: AppLocale;
  vertical?: string | null;
  timezone?: string | null;
  subscriptionAccess?: SubscriptionAccessSnapshot | null;
};

export type AuthSessionResponse = {
  success: true;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
