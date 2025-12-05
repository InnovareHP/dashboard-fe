import AcceptInvitation from "@/components/invitation/invitation";
import {
  createFileRoute,
  notFound,
  useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/invitation/$action")({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { action } = params;

    if (!["accept", "reject"].includes(action)) {
      throw notFound();
    }

    return {
      action,
    };
  },
});

function RouteComponent() {
  const { action } = useRouteContext({ from: "/invitation/$action" }) as {
    action: "accept" | "reject";
  };

  return <AcceptInvitation action={action} />;
}
