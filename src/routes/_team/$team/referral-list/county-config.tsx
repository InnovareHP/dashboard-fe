import CountyConfigPage from "@/components/county-config/county-config-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_team/$team/referral-list/county-config"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <CountyConfigPage />;
}
