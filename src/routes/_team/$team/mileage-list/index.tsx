import MileageListPage from "@/components/mileage-list/mileage-list-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_team/$team/mileage-list/")({
  component: RouteComponent,
  // beforeLoad: async (context) => {
  //   const { memberData } = context.context;
  //   if (memberData?.role !== "liason") {
  //     throw redirect({ to: `/${memberData?.organizationId}` as any });
  //   }
  // },
});

function RouteComponent() {
  return <MileageListPage />;
}
