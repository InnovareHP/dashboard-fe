import { stripeClient } from "@better-auth/stripe/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL!,
  plugins: [
    organizationClient(),
    stripeClient({
      subscription: true,
      
    }),
  ],
  additionalFields: {
    user_is_onboarded: {
      type: "boolean",
      defaultValue: false,
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  refreshToken,
  useActiveMember,
  useActiveOrganization,
} = authClient;
