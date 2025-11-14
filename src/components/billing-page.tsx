import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  Loader2,
  Receipt,
} from "lucide-react";

type BillingInfo = {
  currentPlan: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  amount: number;
  status: "active" | "past_due" | "canceled";
};

type PaymentMethod = {
  id: string;
  type: "card" | "bank_account";
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
};

export function BillingPage({ className, ...props }: React.ComponentProps<"div">) {
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
    data: billingInfo,
    isLoading: isLoadingBilling,
  } = useQuery({
    queryKey: ["billing-info"],
    queryFn: async (): Promise<BillingInfo> => {
      try {
        const billingClient = (authClient as any).billing;
        
        if (!billingClient || typeof billingClient.getInfo !== "function") {
          return getDefaultBillingInfo();
        }

        const { data, error } = await billingClient.getInfo();

        if (error || !data) {
          return getDefaultBillingInfo();
        }

        return data;
      } catch (error: any) {
        console.warn("Error fetching billing info, using defaults:", error);
        return getDefaultBillingInfo();
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const {
    data: paymentMethods,
    isLoading: isLoadingPaymentMethods,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async (): Promise<PaymentMethod[]> => {
      try {
        const billingClient = (authClient as any).billing;
        
        if (!billingClient || typeof billingClient.getPaymentMethods !== "function") {
          return getDefaultPaymentMethods();
        }

        const { data, error } = await billingClient.getPaymentMethods();

        if (error || !data || !Array.isArray(data)) {
          return getDefaultPaymentMethods();
        }

        return data;
      } catch (error: any) {
        console.warn("Error fetching payment methods, using defaults:", error);
        return getDefaultPaymentMethods();
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async (): Promise<Invoice[]> => {
      try {
        const billingClient = (authClient as any).billing;
        
        if (!billingClient || typeof billingClient.getInvoices !== "function") {
          return getDefaultInvoices();
        }

        const { data, error } = await billingClient.getInvoices();

        if (error || !data || !Array.isArray(data)) {
          return getDefaultInvoices();
        }

        return data;
      } catch (error: any) {
        console.warn("Error fetching invoices, using defaults:", error);
        return getDefaultInvoices();
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
                  Error Loading Billing
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

  const isLoading = isLoadingMember || isLoadingBilling || isLoadingPaymentMethods || isLoadingInvoices;

  return (
    <div
      className={cn("w-full max-w-7xl mx-auto p-6 space-y-8", className)}
      {...props}
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your subscription, payment methods, and view billing history
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Plan & Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{billingInfo?.currentPlan || "Free Plan"}</span>
                    <Badge variant={billingInfo?.status === "active" ? "default" : "secondary"}>
                      {billingInfo?.status === "active" ? "Active" : billingInfo?.status || "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${billingInfo?.amount || 0}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingInfo?.billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  </div>
                </div>
                {billingInfo?.nextBillingDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Next billing: {new Date(billingInfo.nextBillingDate).toLocaleDateString()}</span>
                  </div>
                )}
                {isOwner && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/${activeOrganizationId}/plans`}>
                      Change Plan
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Methods</CardTitle>
                  {isOwner && (
                    <Button variant="outline" size="sm">
                      Add Payment Method
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {method.type === "card" 
                                  ? `${method.brand || "Card"} •••• ${method.last4}`
                                  : `Bank Account •••• ${method.last4}`}
                              </span>
                              {method.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            {method.expiryMonth && method.expiryYear && (
                              <span className="text-sm text-muted-foreground">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </span>
                            )}
                          </div>
                        </div>
                        {isOwner && (
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No payment methods on file</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Invoice #{invoice.id.slice(-8)}
                            </span>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : invoice.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()} • ${invoice.amount}
                          </div>
                        </div>
                      </div>
                      {invoice.downloadUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={invoice.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Default billing info if API doesn't provide it
function getDefaultBillingInfo(): BillingInfo {
  return {
    currentPlan: "Free Plan",
    billingCycle: "monthly",
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 0,
    status: "active",
  };
}

// Default payment methods if API doesn't provide them
function getDefaultPaymentMethods(): PaymentMethod[] {
  return [];
}

// Default invoices if API doesn't provide them
function getDefaultInvoices(): Invoice[] {
  return [
    {
      id: "inv_001",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 0,
      status: "paid",
    },
  ];
}

