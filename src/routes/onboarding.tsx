import OnboardingPage from "@/components/onboarding/onboarding";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { User } from "better-auth";

export const Route = createFileRoute("/onboarding")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const user = context.context.user as unknown as User & {
      user_is_onboarded: boolean;
    };

    const { data } = await authClient.organization.getFullOrganization();

    if (!user) {
      throw redirect({ to: "/" });
    }

    if (data?.slug && user?.user_is_onboarded) {
      throw redirect({ to: `/${data.slug}` as any });
    }
  },
});

function RouteComponent() {
  return <OnboardingPage />;
}
  