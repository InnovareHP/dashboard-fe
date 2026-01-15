import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  RotateCcw,
} from "lucide-react";
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
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
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
      className={cn(
        "flex items-center justify-center gap-12 p-4 lg:gap-16",
        className
      )}
      {...props}
    >
      {/* Left Side - Information */}
      <div className="hidden lg:flex flex-col justify-center w-full max-w-lg space-y-10">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Reset Your Password
          </h1>
          <p className="text-xl text-gray-600">
            Don't worry! It happens. We'll help you get back on track.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-50 flex-shrink-0">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Check Your Email
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We'll send you a secure link to reset your password
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Quick & Easy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reset your password in just a few simple steps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl bg-white">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleResetPassword)}
              >
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-xl mb-4">
                    <RotateCcw className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="you@example.com"
                              className="h-12 pl-11 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
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
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm mt-2"
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending reset link...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600 pt-4">
                    <Link
                      to="/"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          Need help?{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
