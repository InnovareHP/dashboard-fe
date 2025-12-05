import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Loader2,
  LogOut,
  Mail,
  Shield,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

export function ProfilePage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } = useSession();
  const user = sessionData?.user;

  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const form = new FormData();
      form.append("file", file);

      // upload route — replace with your route
      const res = await fetch("/api/upload-profile", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!data.url) throw new Error("Upload failed");

      // Update user in Better Auth
      await authClient.updateUser({
        image: data.url,
      });

      toast.success("Profile picture updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    const currentPassword = prompt("Enter current password:");
    const newPassword = prompt("Enter new password:");

    if (!currentPassword || !newPassword) return;

    try {
      setIsChangingPassword(true);
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Error state
  if (!user && !isSessionPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Error Loading Profile
            </h2>
            <p className="text-muted-foreground mb-4">
              Could not load user profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account, profile image, and security
        </p>
      </div>

      {isSessionPending ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* AVATAR + UPLOAD SECTION */}
              <div className="flex items-center gap-6">
                <div
                  className="relative cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  <Avatar className="h-28 w-28 border shadow-sm transition hover:ring-2 hover:ring-primary/50">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name ?? "User"} />
                    ) : (
                      <AvatarFallback className="bg-muted flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                />

                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold">
                    {user?.name || "No name set"}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>

                  {isUploading && (
                    <p className="text-sm text-muted-foreground">
                      Uploading image…
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* USER DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{user?.email}</p>
                </div>

                {user?.emailVerified && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Email Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">
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

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Security and account management tools
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* CHANGE PASSWORD */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>

              <Separator />

              {/* SIGN OUT */}
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
