import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Loader2,
  Mail,
  User,
  Calendar,
  Shield,
  LogOut,
  Edit,
} from "lucide-react";
import { toast } from "@/lib/toast";

export function ProfilePage({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } = useSession();

  // Extract user and session from sessionData
  const user = sessionData?.user;
  const session = sessionData?.session;

  const isLoadingUser = isSessionPending;
  const isErrorUser = !isSessionPending && !user;
  const userError = isErrorUser ? new Error("No user session found") : null;

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  // Show error state if user query fails
  if (isErrorUser) {
    const errorMessage =
      (userError as Error)?.message || "Failed to load profile information";

    return (
      <div
        className={cn("flex items-center justify-center p-4", className)}
        {...props}
      >
        <div className="w-full max-w-6xl">
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Error Loading Profile
                </h2>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="cursor-pointer"
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

  const isLoading = isSessionPending || isLoadingUser;

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your account information and preferences
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your personal account details
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name ?? "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold">
                    {user?.name || "No name set"}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </div>
                  <p className="font-medium">
                    {user?.name || "Not set"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                  <p className="font-medium">
                    {user?.email || "Not set"}
                  </p>
                </div>

                {user?.emailVerified && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Email Status</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Verified
                    </Badge>
                  </div>
                )}

                {user?.createdAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Member Since</span>
                    </div>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  // Navigate to change password or edit profile
                  toast.info("Edit profile feature coming soon");
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  toast.info("Change password feature coming soon");
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>

              <Separator />

              <Button
                variant="destructive"
                className="w-full justify-start cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Session Information Card */}
          {session && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>
                  Current session details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Session ID</div>
                    <p className="font-mono text-xs break-all">
                      {session.id || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Expires At</div>
                    <p className="font-medium">
                      {session.expiresAt
                        ? new Date(session.expiresAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">User ID</div>
                    <p className="font-mono text-xs break-all">
                      {user?.id || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

