import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import type { Subscription } from "@/lib/types";
import { cn, formatCapitalize } from "@/lib/utils";
import { useRouteContext } from "@tanstack/react-router";
import type { Member } from "better-auth/plugins/organization";
import { Calendar } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { PlansPage } from "./plans-page";

export function BillingPage({
  className,
  activeOrganizationId: propOrgId,
  activeSubscription: propSub,
  memberData: propMember,
  context: propContext,
  ...props
}: {
  activeOrganizationId?: string;
  activeSubscription?: Subscription;
  memberData?: Member;
  context?: "/_team" | "/billing";
} & React.ComponentProps<"div">) {
  const context = useRouteContext({ from: propContext ?? "/_team" }) as {
    activeOrganizationId: string;
    activeSubscription: Subscription;
    memberData: Member;
  };

  const activeOrganizationId = propOrgId ?? context.activeOrganizationId;
  const activeSubscription = propSub ?? context.activeSubscription;
  const memberData = propMember ?? context.memberData;

  const billingInfo = activeSubscription && {
    currentPlan: activeSubscription.plan,
    billingCycle: "monthly",
    nextBillingDate: activeSubscription.periodEnd,
    status: activeSubscription.status,
  };

  const openBillingPortal = useCallback(async () => {
    if (!activeOrganizationId) return;

    const { data, error } = await authClient.subscription.billingPortal({
      referenceId: activeOrganizationId,
      returnUrl: `${window.location.href}`,
    });

    if (error) toast.error(error.message);
    if (data?.url) window.location.href = data.url;
  }, [activeOrganizationId]);

  if (!billingInfo) {
    return <PlansPage context={propContext} />;
  }

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your subscription, payment methods, and view billing history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">
                {formatCapitalize(billingInfo.currentPlan)}
              </span>

              <Badge
                variant={
                  billingInfo.status === "active" ||
                  billingInfo.status === "trialing"
                    ? "default"
                    : "secondary"
                }
              >
                {formatCapitalize(billingInfo.status)}
              </Badge>
            </div>

            {billingInfo.nextBillingDate && memberData?.role === "owner" ? (
              <div className="flex items-center gap-2 text-sm mt-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Next billing:{" "}
                  {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm mt-2 text-muted-foreground">
                <span>Contact the owner to upgrade your plan</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={openBillingPortal}
          >
            Manage Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
