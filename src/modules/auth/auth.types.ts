export type AuthUser = {
  id: string;
  name: string;
  email: string;
  businessId: string | null;
  role: string;
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
