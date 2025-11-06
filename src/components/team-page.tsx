import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Crown, Loader2, Mail, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod/v3";
import { ConfirmationDialog } from "./confirmation-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  avatar?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
};

type MessageState = {
  type: "success" | "error";
  message: string;
} | null;

export function TeamPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get current user's member info to check if they're the owner
  const { data: currentMember, isLoading: isLoadingMember, isError: isErrorMember, error: memberError } = useQuery({
    queryKey: ["user-member"],
    queryFn: async (): Promise<TeamMember> => {
      const { data, error } = await authClient.organization.getActiveMember();
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch active member");
      }
      // Validate the response structure
      const member = data as unknown as TeamMember;
      if (!member.id || !member.role) {
        throw new Error("Invalid member data structure");
      }
      return member;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isOwner = currentMember?.role === "OWNER";

  // Fetch team members
  const { 
    data: members, 
    isLoading: isLoadingMembers, 
    isError: isErrorMembers,
    error: membersError 
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: async (): Promise<TeamMember[]> => {
      try {
        // Try to get members - adjust method name based on your API
        const { data, error } = await (authClient.organization as any).listMembers?.() || { data: null, error: null };
        
        if (error) {
          throw new Error(error.message || "Failed to fetch team members");
        }
        
        if (!data) {
          // If API method doesn't exist, return empty array
          return [];
        }
        
        // Validate response structure
        const membersList = Array.isArray(data) ? data : [];
        return membersList.map((member: any) => ({
          id: member.id || member.userId || "",
          name: member.name || member.user?.name || "",
          email: member.email || member.user?.email || "",
          role: (member.role || "MEMBER") as "OWNER" | "ADMIN" | "MEMBER",
          avatar: member.avatar || member.user?.avatar,
          user: member.user,
        })) as TeamMember[];
      } catch (error: any) {
        // If API method doesn't exist, return empty array instead of throwing
        if (error?.message?.includes("listMembers is not a function")) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const addMemberForm = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      })
    ),
    defaultValues: {
      email: "",
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        // Try different possible API method names
        const addMemberMethod = (authClient.organization as any).addMember || 
                               (authClient.organization as any).inviteMember;
        
        if (!addMemberMethod) {
          throw new Error("Add member functionality is not available. Please check your API configuration.");
        }

        const { data, error } = await addMemberMethod({ email });
        
        if (error) {
          const errorMessage = error.message || 
                              error.data?.message || 
                              "Failed to add member. Please try again.";
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (error: any) {
        // Provide more specific error messages
        if (error.message) {
          throw error;
        }
        throw new Error("Failed to add member. Please check the email and try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      addMemberForm.reset();
      setShowAddMember(false);
      setMessage({ type: "success", message: "Member added successfully!" });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to add member. Please try again.";
      addMemberForm.setError("root", { message: errorMessage });
      setMessage({ type: "error", message: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      try {
        // Try different possible API method names
        const removeMemberMethod = (authClient.organization as any).removeMember || 
                                   (authClient.organization as any).deleteMember;
        
        if (!removeMemberMethod) {
          throw new Error("Remove member functionality is not available. Please check your API configuration.");
        }

        const { data, error } = await removeMemberMethod({ memberId });
        
        if (error) {
          const errorMessage = error.message || 
                              error.data?.message || 
                              "Failed to remove member. Please try again.";
          throw new Error(errorMessage);
        }
        
        return data;
      } catch (error: any) {
        if (error.message) {
          throw error;
        }
        throw new Error("Failed to remove member. Please try again.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setMessage({ type: "success", message: "Member removed successfully!" });
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to remove member. Please try again.";
      setMessage({ type: "error", message: errorMessage });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const handleAddMember = async (values: { email: string }) => {
    setMessage(null);
    await addMemberMutation.mutateAsync(values.email);
  };

  const handleRemoveClick = (memberId: string) => {
    setRemoveMemberId(memberId);
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    if (removeMemberId) {
      setMessage(null);
      removeMemberMutation.mutate(removeMemberId);
      setRemoveMemberId(null);
    }
  };

  // Display members - prioritize API data, fallback to current member if API fails
  const displayMembers = (members && members.length > 0) 
    ? members 
    : (currentMember && !isErrorMembers) 
      ? [currentMember]
      : [];

  // Show error state if queries fail
  if (isErrorMember || isErrorMembers) {
    const errorMessage = (memberError as Error)?.message || 
                        (membersError as Error)?.message || 
                        "Failed to load team information";
    
    return (
      <div className={cn("flex items-center justify-center p-4", className)} {...props}>
        <div className="w-full max-w-2xl">
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Error Loading Team
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ["user-member"] });
                    queryClient.invalidateQueries({ queryKey: ["team-members"] });
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-4", className)} {...props}>
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-5">
              {/* Message Notification */}
              {message && (
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                    message.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  )}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium flex-1">{message.message}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessage(null)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Team Members
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your team members and their access
                </p>
              </div>

              {isOwner && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setShowAddMember(!showAddMember);
                      setMessage(null);
                      addMemberForm.clearErrors();
                    }}
                    className="h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              )}

              {showAddMember && isOwner && (
                <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <CardContent className="p-4">
                    <Form {...addMemberForm}>
                      <form
                        className="space-y-4"
                        onSubmit={addMemberForm.handleSubmit(handleAddMember)}
                      >
                        {/* Display root/form-level errors */}
                        {addMemberForm.formState.errors.root && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-sm">{addMemberForm.formState.errors.root.message}</p>
                          </div>
                        )}
                        
                        <FormField
                          control={addMemberForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    {...field}
                                    placeholder="Enter email address"
                                    className="h-10 pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={addMemberMutation.isPending}
                            className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200"
                          >
                            {addMemberMutation.isPending ? (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Adding...</span>
                              </div>
                            ) : (
                              "Add Member"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddMember(false);
                              addMemberForm.reset();
                              addMemberForm.clearErrors();
                            }}
                            className="h-10 border-slate-200 dark:border-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {isLoadingMember || isLoadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : displayMembers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No team members found</p>
                  </div>
                ) : (
                  displayMembers.map((member) => {
                    const memberName = member.user?.name || member.name || "Unknown";
                    const memberEmail = member.user?.email || member.email || "";
                    const memberAvatar = member.user?.avatar || member.avatar;
                    const initials = memberName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <Card
                        key={member.id}
                        className="border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                {memberAvatar && (
                                  <AvatarImage src={memberAvatar} alt={memberName} />
                                )}
                                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {memberName}
                                  </p>
                                  {member.role === "OWNER" && (
                                    <Badge
                                      variant="default"
                                      className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                                    >
                                      <Crown className="w-3 h-3 mr-1" />
                                      Owner
                                    </Badge>
                                  )}
                                  {member.role === "ADMIN" && (
                                    <Badge variant="secondary">Admin</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {memberEmail}
                                </p>
                              </div>
                            </div>
                            {isOwner && member.role !== "OWNER" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveClick(member.id)}
                                disabled={removeMemberMutation.isPending}
                                className="border-red-200 dark:border-red-800 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                              >
                                {removeMemberMutation.isPending && removeMemberId === member.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 mr-1" />
                                )}
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Remove Team Member"
        description="Are you sure you want to remove this member from the team? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
