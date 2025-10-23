import Timeline from "@/components/timeline/timeline";
import { getLeadTimeline } from "@/services/lead/lead-service";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_team/$team/master-list/leads/$lead/timeline"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const timeline = useSuspenseQuery({
    queryKey: ["lead-timeline", Route.useParams().lead],
    queryFn: () => getLeadTimeline(Route.useParams().lead),
  });

  return <Timeline history={timeline.data} />;
}
