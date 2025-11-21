import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "professional",
    name: "Pro Plan",
    price: 49,
    interval: "month",
    isPopular: true,
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
  },
];

export function PlansPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const activeOrganizationId = activeOrg?.id;

  const location = useLocation();

  const { data: subscriptionStatus = "none", isLoading } = useQuery({
    queryKey: ["subscription-status", activeOrganizationId],
    enabled: !!activeOrganizationId,
    queryFn: async () => {
      const { data: subscriptions } = await authClient.subscription.list({
        query: {
          referenceId: activeOrganizationId!,
        },
      });

      const activeSubscription = subscriptions?.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
      );

      return activeSubscription ? "active" : "none";
    },
  });

  const SubscribePlan = async () => {
    try {
      if (!activeOrganizationId) return;

      await authClient.subscription.upgrade({
        plan: "Dashboard",
        referenceId: activeOrganizationId,
        seats: 10,
        successUrl: `${import.meta.env.VITE_APP_URL}${location.href}/success`,
        cancelUrl: `${import.meta.env.VITE_APP_URL}${location.href}`,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your team. All plans include our core
          features with flexible options to scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const isSubscribed = subscriptionStatus === "active";

          return (
            <Card
              key={plan.id}
              className={cn(
                plan.id === "professional" && "border-primary shadow-lg"
              )}
            >
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>

                    {plan.isPopular && (
                      <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-6">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isLoading ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Checking subscription...
                  </Button>
                ) : isSubscribed ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    You are already subscribed
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={SubscribePlan}>
                    Upgrade to Pro
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
