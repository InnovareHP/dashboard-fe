import OnboardingPage from "@/components/onboarding/onboarding";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { User } from "better-auth";

export const Route = createFileRoute("/onboarding")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const user = context.context.user as unknown as User & {
      user_is_onboarded: boolean;
    };

    if (!user) {
      throw redirect({ to: "/" });
    }

    if (user?.user_is_onboarded) {
      throw redirect({ to: "/dashboard" as any });
    }
  },
});

function RouteComponent() {
  return <OnboardingPage />;
}
