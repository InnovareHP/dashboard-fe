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
import { Loader2 } from "lucide-react";

type Organization = {
  id: string;
  name: string;
  plan: string;
};

type OrganizationsResponse = { organizations: Organization[] };

type Member = {
  id: string;
  name: string;
};

type ActiveOrg = {
  id: string;
  name: string;
  logo?: string;
  slug: string;
};

export const Route = createFileRoute("/_team")({
  beforeLoad: async ({ params }: { params: { team: string } }) => {
    const { data, error } = await authClient.organization.getFullOrganization();

    if (error) {
      throw redirect({ to: "/" });
    }

    const activeOrg = (data ?? null) as ActiveOrg;

    if (!activeOrg) {
      throw redirect({ to: "/" });
    }

    if (params.team !== activeOrg.slug) {
      throw redirect({ to: `/${activeOrg.slug}` as any });
    }

    return { activeOrg };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const results = useQueries<
    [
      UseQueryResult<OrganizationsResponse>,
      UseQueryResult<Member>,
      UseQueryResult<ActiveOrg>,
    ]
  >({
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
      {
        queryKey: ["user-member"],
        queryFn: async (): Promise<Member> => {
          const { data, error } =
            await authClient.organization.getActiveMember();
          if (error || !data) {
            throw new Error("Failed to fetch active member");
          }
          return data as unknown as Member;
        },
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ["active-org"],
        queryFn: async (): Promise<ActiveOrg> => {
          const { data, error } =
            await authClient.organization.getFullOrganization();
          if (error || !data) {
            throw new Error("Failed to fetch active organization");
          }
          return data as ActiveOrg;
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
