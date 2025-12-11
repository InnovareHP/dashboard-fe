import MarketingReportPage from "@/components/marketing-report/marketing-report-page";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Session } from "better-auth";

export const Route = createFileRoute("/_team/$team/marketing-report/")({
  beforeLoad: async (context) => {
    const session = context.context.session as Session & {
      activeOrganizationId: string;
    };

    if (!session?.activeOrganizationId) {
      throw redirect({ to: "/login" });
    }

    const memberData = await authClient.organization.getActiveMember();

    if (
      memberData.data?.role !== "owner" &&
      memberData.data?.role !== "admin"
    ) {
      throw redirect({ to: `/${session.activeOrganizationId}` as any });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <MarketingReportPage />;
}

