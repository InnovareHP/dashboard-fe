import MarketLogPage from "@/components/market-log/market-log";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_team/$team/marketing-log/")({
  component: RouteComponent,
  beforeLoad: async () => {
    // const { memberData } = context.context;
    // if (memberData?.role !== "liason") {
    //   throw redirect({ to: `/${memberData?.organizationId}` as any });
    // }
  },
});

function RouteComponent() {
  return <MarketLogPage />;
}
