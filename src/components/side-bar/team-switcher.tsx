import { ChevronsUpDown, User } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";

type Organization = {
  id?: string;
  name: string;
  logo?: string | null;
  slug: string;
  createdAt: Date;
  metadata?: any;
};

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const orgData = queryClient.getQueryData(["organizations"]) as Organization[];

  const activeOrg = queryClient.getQueryData(["active-org"]) as Organization;

  const fetchOrganizations = React.useCallback(
    () => authClient.organization.list(),
    []
  );

  const prefetchOrganizations = React.useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["organizations"],
      queryFn: fetchOrganizations,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, fetchOrganizations]);

  const teams: Organization[] = orgData ?? [];

  const [activeTeam, setActiveTeam] = React.useState<Organization | null>(null);

  const ActiveLogo = activeTeam?.logo ?? User;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu
          onOpenChange={(next) => {
            if (next) prefetchOrganizations();
          }}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              onMouseEnter={prefetchOrganizations}
              onFocus={prefetchOrganizations}
              onTouchStart={prefetchOrganizations}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ActiveLogo className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrg?.name ?? "User"}
                  </span>
                  <span className="truncate text-xs">
                    {activeOrg?.name ?? "Select a team"}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto" />
              </>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>

            {teams.map((team, index) => {
              const Logo = team.logo ?? User;
              return (
                <DropdownMenuItem
                  key={team.id ?? team.name}
                  onMouseEnter={prefetchOrganizations}
                  onFocus={prefetchOrganizations}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Logo className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{team.name}</span>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
