import MileageReportPage from "@/components/mileage-list/mileage-report-page";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Session } from "better-auth";

export const Route = createFileRoute("/_team/$team/mileage-report/")({
  component: RouteComponent,
  beforeLoad: async (context) => {
    const session = context.context.session as unknown as Session & {
      memberRole: string;
      activeOrganizationId: string;
    };

    if (session?.memberRole !== "owner") {
      throw redirect({ to: `/${session.activeOrganizationId}` as any });
    }
  },
});

function RouteComponent() {
  return <MileageReportPage />;
}
