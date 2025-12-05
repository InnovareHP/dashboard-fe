import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Loader2, Mail, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v3";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetPassword = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password/verify`,
      });

      if (error) {
        return toast.error(error.message);
      }

      toast.success("Password reset email sent successfully");
    } catch (error) {
      toast.error("Failed to send password reset email");
    }
  };

  return (
    <div
      className={cn("flex items-center justify-center p-4", className)}
      {...props}
    >
      <div className="w-full max-w-md">
        <Card className="overflow-hidden shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(handleResetPassword)}
              >
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl mb-4">
                    <RotateCcw className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Reset Password
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Enter your email address and we'll send you a link to reset
                    your password
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              {...field}
                              placeholder="Enter your email"
                              className="h-10 pl-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Remember your password?{" "}
                    <Link
                      to="/"
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          By clicking continue, you agree to our{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors duration-200"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
