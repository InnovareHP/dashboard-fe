import {
  Award,
  Check,
  Clock,
  Mail,
  MoreHorizontal,
  MoreVertical,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Invitation } from "better-auth/plugins";
import { formatDate } from "date-fns";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ReusableTable } from "./reusable-table/generic-table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const formSchema = z.object({
  email: z.email(),
  role: z.enum(["member", "owner"]),
  message: z.string(),
});

const TeamPage = () => {
  const { data: organizationData } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "member",
      message: "",
    },
    mode: "onChange",
  });
  const [memberTableField, setMemberTableField] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setMemberTableField((prev) => ({
          ...prev,
          search: val,
        }));
      }, 500),
    []
  );

  const { data: invitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data } = await authClient.organization.listInvitations({
        query: {
          organizationId: organizationData?.id ?? "",
        },
      });
      return data;
    },
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ["member", memberTableField],
    enabled: !!organizationData?.id,
    queryFn: async () =>
      await authClient.organization.listMembers({
        query: {
          organizationId: organizationData?.id ?? "",
          limit: memberTableField.limit.toString(),
          offset: memberTableField.page,
          sortBy: "createdAt",
          sortDirection: "desc",
          filterOperator: "eq",
          filterValue: memberTableField.search,
        },
      }),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleInvite = async (data: z.infer<typeof formSchema>) => {
    try {
      await authClient.organization.inviteMember({
        email: data.email,
        role: data.role as "member" | "admin" | "owner",
        organizationId: organizationData?.id ?? "",
        resend: true,
      });
      setIsInviteDialogOpen(false);

      form.reset();

      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const handleResendInvitation = async (data: Invitation) => {
    try {
      await authClient.organization.inviteMember({
        email: data.email,
        role: data.role as "member" | "admin" | "owner",
        organizationId: data.organizationId,
        resend: true,
      });
      toast.success("Invitation sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await authClient.organization.cancelInvitation({
        invitationId: invitationId,
      });

      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const handleRemoveFromTeam = async (memberId: string) => {
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: organizationData?.id ?? "",
      });

      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Member removed from team successfully");
    } catch (error) {
      toast.error("Failed to remove member from team");
    }
  };

  const teamStats = useMemo(() => {
    return {
      totalMembers: employees?.data?.total,
      activeMembers: employees?.data?.total,
      pendingInvites: invitations?.length,
    };
  }, [employees, invitations]);

  return (
    <div className="min-h-screen p-0 sm:p-6 rounded-xl">
      <div className="max-w-8xl mx-auto space-y-8">
        <div className="flex flex-wrap space-y-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and collaborate effectively
            </p>
          </div>
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2 w-full sm:w-auto">
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {organizationData?.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleInvite)}>
                <div className="space-y-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@email.com"
                    {...form.register("email")}
                  />

                  <Label htmlFor="role">Role</Label>
                  <Select
                    {...form.register("role")}
                    onValueChange={(value) =>
                      form.setValue("role", value as "member" | "owner")
                    }
                    defaultValue="member"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Welcome to our team!"
                    rows={3}
                    {...form.register("message")}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    className="flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {form.formState.isSubmitting
                        ? "Sending..."
                        : "Send Invitation"}
                    </span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-wrap sm:flex-nowrap justify-center items-center space-x-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={organizationData?.logo ?? ""}
                  alt={organizationData?.name ?? ""}
                  className="w-full h-full object-cover"
                />
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold"
                  style={{ display: "none" }}
                >
                  {organizationData?.name?.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {organizationData?.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Founded</p>
                <p className="font-semibold">
                  {new Date(
                    organizationData?.createdAt ?? ""
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats.totalMembers ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats.activeMembers ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Invites
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamStats.pendingInvites ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card className="bg-white/95 backdrop-blur border-0">
              <CardHeader>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Employees
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search"
                        value={memberTableField.search}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ReusableTable
                  data={Array.isArray(employees?.data) ? employees.data : []}
                  columns={[
                    {
                      key: "user_name",
                      header: "Name",
                      render: (row) => (
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={row?.user_image} />
                            <AvatarFallback>
                              {row?.user_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{row?.user_name}</span>
                        </div>
                      ),
                    },
                    {
                      key: "user_email",
                      header: "Email",
                      render: (row) => row?.user_email,
                    },
                    {
                      key: "member_position",
                      header: "Role",
                      render: (row) => row?.member_position,
                    },
                    {
                      key: "member_created_at",
                      header: "Joined Date",
                      render: (row) =>
                        formatDate(
                          new Date(row?.member_created_at ?? ""),
                          "MM/dd/yyyy"
                        ),
                    },
                    {
                      key: "action",
                      header: "Action",
                      render: (row) => (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveFromTeam(row?.user_id)}
                            >
                              Remove From Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ),
                    },
                  ]}
                  currentPage={memberTableField.page}
                  itemsPerPage={10}
                  onPageChange={(page) => {
                    setMemberTableField((prev) => ({
                      ...prev,
                      page,
                    }));
                  }}
                  totalCount={employees?.data?.total}
                  emptyMessage="No members found"
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Pending Invitations</span>
                  <Badge variant="secondary">{invitations?.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea>
                  {invitations?.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No pending invitations
                      </h3>
                      <p className="text-gray-600">
                        All team members have been successfully onboarded.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations?.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gray-200">
                                {invitation.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {invitation.email}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{invitation.role}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(invitation.status)}
                            <div className="text-sm text-gray-500">
                              {formatDate(
                                new Date(invitation.expiresAt),
                                "MM/dd/yyyy"
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleResendInvitation(invitation)
                                  }
                                >
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleCancelInvitation(invitation.id)
                                  }
                                >
                                  Cancel Invitation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamPage;
