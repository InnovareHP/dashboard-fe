// routes/_team/$team/index.tsx
import Loader from "@/components/loader";
import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/ui/bread-crumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { Session, User } from "better-auth";

type Organization = {
  id: string;
  name: string;
  plan: string;
};

type OrganizationsResponse = { organizations: Organization[] };

export const Route = createFileRoute("/_team")({
  beforeLoad: async (context) => {
    const params = context.params as { team: string };
    const user = context.context.user as unknown as User & {
      user_is_onboarded: boolean;
    };

    if (!user) {
      throw redirect({ to: "/login" as any });
    }

    const session = context.context.session as unknown as Session & {
      activeOrganizationId: string;
    };

    if (!session.activeOrganizationId) {
      throw redirect({ to: "/login" as any });
    }

    if (params.team !== session.activeOrganizationId) {
      throw redirect({ to: `/${session.activeOrganizationId}` as any });
    }

    const [subscriptions, memberData] = await Promise.all([
      authClient.subscription.list({
        query: {
          referenceId: session.activeOrganizationId,
        },
      }),
      authClient.organization.getActiveMember(),
    ]);

    const activeSubscription = subscriptions?.data?.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      throw redirect({
        to: `/billing` as any,
      });
    }

    return {
      activeOrganizationId: session.activeOrganizationId,
      activeSubscription,
      user,
      memberData: memberData.data,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const organizations = useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<OrganizationsResponse> => {
      const { data, error } = await authClient.organization.list();
      if (error || !data) {
        throw new Error("Failed to fetch organizations");
      }
      return data as unknown as OrganizationsResponse;
    },
  });

  return (
    <SidebarProvider>
      <Loader isLoading={organizations.isLoading} />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
