import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
  Zap,
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

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const formSchema = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
      name: z.string().min(1),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password and confirm password must match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: `${import.meta.env.VITE_APP_URL}/onboarding`,
      });

      if (error) {
        return toast.error(error.message);
      }

      toast.success(
        "Account created successfully, check your email to verify your account."
      );

      form.reset();
    } catch (error) {
      return toast.error("Failed to create account");
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
      {/* Left Side - Branding/Benefits */}
      <div className="hidden lg:flex flex-col justify-center w-full max-w-xl space-y-10">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Join Referral Intelligence Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Start optimizing your healthcare marketing today
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Get Started in Minutes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simple setup process to get your team up and running quickly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-50 flex-shrink-0">
              <Zap className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Instant Access
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Start tracking metrics and analytics immediately after signup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl bg-white">
          <CardContent className="p-8">
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleRegister)}
              >
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-xl mb-4">
                    <UserPlus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Sign up to get started with your free account
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="John Doe"
                              className="h-12 pl-11 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="••••••••"
                              type="password"
                              className="h-12 pl-11 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              {...field}
                              placeholder="••••••••"
                              type="password"
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
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-600 pt-4">
                    Already have an account?{" "}
                    <Link
                      to="/"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Sign in instead
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
