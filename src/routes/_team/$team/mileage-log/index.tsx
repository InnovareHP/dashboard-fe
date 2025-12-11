import MileageLogPage from "@/components/mileage-log/mileage-log-page";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Session } from "better-auth";

export const Route = createFileRoute("/_team/$team/mileage-log/")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const session = context.context.session as unknown as Session & {
      memberRole: string;
      activeOrganizationId: string;
    };
    if (session?.memberRole !== "liason") {
      throw redirect({ to: `/${session.activeOrganizationId}` as any });
    }
  },
});

function RouteComponent() {
  return <MileageLogPage />;
}
