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
import { useQueryClient } from "@tanstack/react-query";
import type { Organization } from "better-auth/plugins/organization";
import { CircuitBoard, Settings2, SquareTerminal } from "lucide-react";
import * as React from "react";

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const qc = useQueryClient();
  const activeMember = qc.getQueryData(["active-org"]) as Organization;

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
            url: `/${activeMember?.slug}`,
          },
        ],
      },
      {
        title: "Marketing",
        icon: CircuitBoard,
        items: [
          {
            title: "Master List",
            url: `/${activeMember?.slug}/master-list`,
          },
        ],
      },

      {
        title: "Settings",
        url: `/${activeMember?.slug}/settings`,
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: `/${activeMember?.slug}/team`,
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
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
