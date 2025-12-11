import MileageReportPage from "@/components/mileage-list/mileage-report-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_team/$team/mileage-report/")({
  component: RouteComponent,
  // beforeLoad: async (context) => {
  //   const { memberData } = context.context;
  //   if (memberData?.role !== "liason") {
  //     throw redirect({ to: `/${memberData?.organizationId}` as any });
  //   }
  // },
});

function RouteComponent() {
  return <MileageReportPage />;
}
