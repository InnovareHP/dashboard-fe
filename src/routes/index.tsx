import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    throw redirect({ to: "/login" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
