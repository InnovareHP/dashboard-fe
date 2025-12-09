import { stripeClient } from "@better-auth/stripe/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, liason, owner } from "./permissions";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8080",
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        liason,
        admin,
      },
    }),
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
