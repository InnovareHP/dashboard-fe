import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_team/$team/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
