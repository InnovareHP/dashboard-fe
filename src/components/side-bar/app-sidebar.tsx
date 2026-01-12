import { NavMain } from "@/components/side-bar/nav-main";
import { NavUser } from "@/components/side-bar/nav-user";
import { TeamSwitcher } from "@/components/side-bar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { createLead } from "@/services/lead/lead-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type User as BetterAuthUser } from "better-auth";
import type { Member, Organization } from "better-auth/plugins/organization";
import {
  CircuitBoard,
  FileText,
  Folder,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import AddRow from "../reusable-table/add-row";

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
          // {
          //   title: "Master List Analytics",
          //   url: `/${activeOrganizationId}/master-list-analytics`,
          // },
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
          // {
          //   title: "Referral List",
          //   url: `/${activeOrganizationId}/referral-list`,
          // },
          ...(memberData?.role === "liason"
            ? [
                {
                  title: "Mileage Log",
                  url: `/${activeOrganizationId}/mileage-log`,
                },
                {
                  title: "Marketing Log",
                  url: `/${activeOrganizationId}/marketing-log`,
                },
              ]
            : []),
        ],
      },

      ...(memberData?.role === "owner"
        ? [
            {
              title: "Reports",
              icon: FileText,
              items: [
                {
                  title: "Mileage Report",
                  url: `/${activeOrganizationId}/mileage-report`,
                },

                {
                  title: "Marketing Report",
                  url: `/${activeOrganizationId}/marketing-report`,
                },
              ],
            },
          ]
        : []),
      {
        title: "Import",
        icon: Folder,
        items: [
          {
            title: "Master List",
            url: `/${activeOrganizationId}/import/master-list`,
          },
          // {
          //   title: "Referral List",
          //   url: `/${activeOrganizationId}/import/referral-list`,
          // },
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

          // {
          //   title: "County Config",
          //   url: `/${activeOrganizationId}/referral-list/county-config`,
          // },
        ],
      },
    ],
  };

  const { open } = useSidebar();

  const queryClient = useQueryClient();

  const addLeadMutation = useMutation({
    mutationFn: createLead,
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const previousData = queryClient.getQueryData(["leads"]);
      queryClient.setQueryData(["leads"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newLead[0], ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      return { previousData };
    },
    onError: (_err, _newLead, context: any) => {
      queryClient.setQueryData(["leads"], context.previousData);
      toast.error("Failed to add lead.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const handleAddNewLead = (value: string) => {
    const newLead = [
      {
        id: uuidv4(),
        lead_name: value,
        status: "",
        activities_time: 0,
        create_contact: "",
        company: "",
        title: "",
        email: "",
        phone: "",
        last_interaction: "",
        active_sequences: 0,
      },
    ];
    addLeadMutation.mutate(newLead);
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          activeOrganizationId={activeOrganizationId}
          organizations={organizations}
        />
        {open && <AddRow isReferral={false} onAdd={handleAddNewLead} />}
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
