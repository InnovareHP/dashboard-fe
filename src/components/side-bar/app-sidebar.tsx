import { NavMain } from "@/components/side-bar/nav-main";
import { NavUser } from "@/components/side-bar/nav-user";
import { TeamSwitcher } from "@/components/side-bar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useRouteContext } from "@tanstack/react-router";
import { CircuitBoard, Settings2, SquareTerminal } from "lucide-react";
import * as React from "react";

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activeOrganizationId, memberData } = useRouteContext({
    from: "/_team",
  });
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Analytics",
            url: `/${activeOrganizationId}`,
          },
        ],
      },
      {
        title: "Marketing",
        icon: CircuitBoard,
        items: [
          {
            title: "Master List",
            url: `/${activeOrganizationId}/master-list`,
          },
          {
            title: "Referral List",
            url: `/${activeOrganizationId}/referral-list`,
          },
          {
            title: "Mileage Log",
            url: `/${activeOrganizationId}/mileage-log`,
          },
          {
            title: "Mileage List",
            url: `/${activeOrganizationId}/mileage-list`,
          },
          {
            title: "Marketing Log",
            url: `/${activeOrganizationId}/marketing-log`,
          },
        ],
      },

      {
        title: "Settings",
        url: `/${activeOrganizationId}/settings`,
        icon: Settings2,
        items: [
          {
            title: "Team",
            url: `/${activeOrganizationId}/team`,
          },
          ...(memberData?.role === "owner"
            ? [
                {
                  title: "Plans",
                  url: `/${activeOrganizationId}/plans`,
                },
                {
                  title: "Billing",
                  url: `/${activeOrganizationId}/settings/billing`,
                },
              ]
            : []),

          {
            title: "County Config",
            url: `/${activeOrganizationId}/referral-list/county-config`,
          },
        ],
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
