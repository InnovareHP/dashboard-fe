import MarketingReportPage from "@/components/marketing-report/marketing-report-page";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Session } from "better-auth";

export const Route = createFileRoute("/_team/$team/marketing-report/")({
  beforeLoad: async (context) => {
    const session = context.context.session as unknown as Session & {
      memberRole: string;
      activeOrganizationId: string;
    };
    if (session?.memberRole !== "owner") {
      throw redirect({ to: `/${session.activeOrganizationId}` as any });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <MarketingReportPage />;
}
