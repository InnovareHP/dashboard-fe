import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { User } from "better-auth";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const user = context.context.user as unknown as User & {
      user_is_onboarded: boolean;
    };

    if (user) {
      throw redirect({ to: "/onboarding" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
