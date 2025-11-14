import { ProfilePage } from "@/components/profile-page";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { User } from "better-auth";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context }) => {
    const user = context.user as User | null;

    // Redirect to login if user is not authenticated
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/profile",
        },
      });
    }

    // Check if user is onboarded, redirect to onboarding if not
    const userWithOnboarding = user as User & { user_is_onboarded?: boolean };
    if (!userWithOnboarding.user_is_onboarded) {
      throw redirect({
        to: "/onboarding",
      });
    }

    return {
      user,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfilePage />;
}

