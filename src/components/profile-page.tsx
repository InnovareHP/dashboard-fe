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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/services/image/image-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { AlertCircle, LogOut, Mail, Shield, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "sonner";
import { z } from "zod";

/* ---------------- PASSWORD SCHEMA ---------------- */

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

/* ---------------- COMPONENT ---------------- */

export function ProfilePage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, memberData } = useRouteContext({ from: "/_team" });
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  /* ---------------- PROFILE IMAGE UPLOAD ---------------- */

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

      const data = await uploadImage(file);
      if (!data?.url) throw new Error("Upload failed");

      await authClient.updateUser(
        { image: data.url },
        {
          onSuccess: () => {
            toast.success("Profile picture updated!");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );

      router.invalidate();
    } catch (error) {
      toast.error("Failed to upload profile picture.");
    } finally {
      setIsUploading(false);

      // ✅ reset input so same file can be reselected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* ---------------- CHANGE PASSWORD ---------------- */

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    try {
      setIsChangingPassword(true);

      await authClient.changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          onSuccess: () => {
            toast.success("Password changed successfully!");
            passwordForm.reset();
            setShowPasswordForm(false);
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );

      toast.success("Password changed successfully!");
      router.invalidate();
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ---------------- SIGN OUT ---------------- */

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  /* ---------------- ERROR STATE ---------------- */

  if (!user) {
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

  /* ---------------- UI ---------------- */

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account, profile image, and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------- PROFILE CARD ---------------- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <Avatar className="h-28 w-28 border shadow-sm transition hover:ring-2 hover:ring-primary/50">
                  {user?.image ? (
                    <AvatarImage
                      src={`${user.image}?t=${Date.now()}`}
                      alt={user.name ?? "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageUpload}
              />

              <div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>

              {user?.emailVerified && (
                <div>
                  <p className="text-sm text-muted-foreground">Email Status</p>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Verified
                  </Badge>
                </div>
              )}

              {memberData?.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(memberData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------------- ACCOUNT ACTIONS ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Security and account management tools
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              disabled={isChangingPassword}
            >
              <Shield className="w-4 h-4 mr-2" />
              {showPasswordForm ? "Cancel" : "Change Password"}
            </Button>

            {showPasswordForm && (
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-4 border rounded-lg p-4"
              >
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            <Separator />

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
    </div>
  );
}
