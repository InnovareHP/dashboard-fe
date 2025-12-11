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
import type { User as BetterAuthUser } from "better-auth";
import type { Member, Organization } from "better-auth/plugins/organization";
import {
  CircuitBoard,
  FileText,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import * as React from "react";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeOrganizationId: string;
  memberData: Member;
  organizations: Organization[];
  user: BetterAuthUser;
};
export function AppSidebar({
  activeOrganizationId,
  memberData,
  organizations,
  user,
  ...props
}: AppSidebarProps) {
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
            title: "Marketing Log",
            url: `/${activeOrganizationId}/marketing-log`,
          },
        ],
      },
      {
        title: "Reports",
        icon: FileText,
        items: [
          {
            title: "Mileage Report",
            url: `/${activeOrganizationId}/mileage-report`,
          },
          ...(memberData?.role === "owner" || memberData?.role === "admin"
            ? [
                {
                  title: "Marketing Report",
                  url: `/${activeOrganizationId}/marketing-report`,
                },
              ]
            : []),
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
        <TeamSwitcher
          activeOrganizationId={activeOrganizationId}
          organizations={organizations}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} activeOrganizationId={activeOrganizationId} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
