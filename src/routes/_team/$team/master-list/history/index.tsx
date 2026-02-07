import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_team/$team/master-list/history/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_team/$team/master-list/history/"!</div>;
}
