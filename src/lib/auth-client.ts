import { stripeClient } from "@better-auth/stripe/client";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, liason, owner } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    stripeClient({
      subscription: true,
    }),
    organizationClient({
      ac,
      roles: {
        owner,
        liason,
      },
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
