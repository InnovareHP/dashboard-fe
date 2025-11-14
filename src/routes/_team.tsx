// routes/_team/$team/index.tsx
import { AppSidebar } from "@/components/side-bar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/ui/bread-crumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { Session, User } from "better-auth";
import { Loader2 } from "lucide-react";

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

    return { activeOrganizationId: session.activeOrganizationId };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const results = useQueries<[UseQueryResult<OrganizationsResponse>]>({
    queries: [
      {
        queryKey: ["organizations"],
        queryFn: async (): Promise<OrganizationsResponse> => {
          const { data, error } = await authClient.organization.list();
          if (error || !data) {
            throw new Error("Failed to fetch organizations");
          }
          return data as unknown as OrganizationsResponse;
        },
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  return (
    <SidebarProvider>
      {results.some((result) => result.isLoading) && (
        <div className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      )}
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
