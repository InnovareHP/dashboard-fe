import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
};

export function PlansPage({ className, ...props }: React.ComponentProps<"div">) {
  const { activeOrganizationId } = useRouteContext({ from: "/_team" });

  const {
    data: currentMember,
    isLoading: isLoadingMember,
    isError: isErrorMember,
    error: memberError,
  } = useQuery({
    queryKey: ["user-member"],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getActiveMember();
      if (error || !data) {
        throw new Error(error?.message || "Failed to fetch active member");
      }
      return data as any;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const isOwner = currentMember?.role === "OWNER";

  const {
    data: plans,
    isLoading: isLoadingPlans,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async (): Promise<Plan[]> => {
      try {
        const plansClient = (authClient as any).plans;
        
        if (!plansClient || typeof plansClient.list !== "function") {
          return getDefaultPlans();
        }

        const { data, error } = await plansClient.list();

        if (error || !data || !Array.isArray(data) || data.length === 0) {
          return getDefaultPlans();
        }

        return data;
      } catch (error: any) {
        console.warn("Error fetching plans, using defaults:", error);
        return getDefaultPlans();
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Show error state only if member query fails
  if (isErrorMember) {
    const errorMessage =
      (memberError as Error)?.message ||
      "Failed to load user information";

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
                  Error Loading Plans
                </h2>
                <p className="text-muted-foreground mb-4">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
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
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your team. All plans include our core features with flexible options to scale.
        </p>
      </div>

      {/* Plans Cards */}
      {isLoadingMember || isLoadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6">
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Up to 3 team members</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Basic analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Up to 1,000 referrals per month</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Email support (48h response)</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Standard data export</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Basic reporting tools</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Community forum access</span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled
              >
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="border-primary shadow-lg">
            <CardHeader className="pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Pro Plan</h3>
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6">
              <ul className="space-y-3 flex-1">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Up to 15 team members</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Unlimited referrals</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority email support (24h response)</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced data export & API access</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Custom reporting & dashboards</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Automated workflows</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Integration with 10+ tools</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced security features</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Monthly performance reports</span>
                </li>
              </ul>
              <Link
                to="/$team/checkout"
                params={{ team: activeOrganizationId }}
                search={{ planId: "professional" }}
                className="w-full"
              >
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!isOwner}
                >
                  {!isOwner ? (
                    "Contact Admin"
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Default plans if API doesn't provide them
function getDefaultPlans(): Plan[] {
  return [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      interval: "month",
      features: [
        "Up to 3 team members",
        "Basic analytics dashboard",
        "Up to 1,000 referrals per month",
        "Email support (48h response)",
        "Standard data export",
        "Basic reporting tools",
        "Community forum access",
      ],
      isCurrent: true,
    },
    {
      id: "professional",
      name: "Professional",
      price: 49,
      interval: "month",
      features: [
        "Up to 15 team members",
        "Advanced analytics & insights",
        "Unlimited referrals",
        "Priority email support (24h response)",
        "Advanced data export & API access",
        "Custom reporting & dashboards",
        "Automated workflows",
        "Integration with 10+ tools",
        "Advanced security features",
        "Monthly performance reports",
      ],
      isPopular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199,
      interval: "month",
      features: [
        "Unlimited team members",
        "Enterprise-grade analytics",
        "Unlimited referrals & data",
        "Dedicated account manager",
        "24/7 phone & chat support",
        "Full API access & webhooks",
        "Custom integrations & development",
        "White-label options",
        "Advanced security & compliance",
        "SLA guarantee (99.9% uptime)",
        "Custom training & onboarding",
        "Quarterly business reviews",
      ],
    },
  ];
}
