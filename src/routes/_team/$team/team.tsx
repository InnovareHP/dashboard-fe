import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_team/$team/team')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_team/$team/team"!</div>
}
