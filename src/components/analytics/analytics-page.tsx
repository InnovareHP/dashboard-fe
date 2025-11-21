import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsResponse } from "@/lib/types";
import { getAnalytics } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import * as Recharts from "recharts";

export default function ReferralAnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await getAnalytics();
      return res as unknown as AnalyticsResponse;
    },
  });

  const barData =
    analytics?.facilities?.map((f) => ({
      name: f.value ?? "Unknown Facility",
      count: f._count.value,
    })) ?? [];

  const pieData =
    analytics?.payers?.map((p) => ({
      name: p.value ?? "Unknown",
      value: p._count.value,
    })) ?? [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
  } = Recharts;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Behavioral Health Referral Intelligence
        </h1>
        <p className="text-muted-foreground mt-2">
          Track key outreach and referral performance metrics to strengthen
          partnerships and improve admissions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Referring Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            {ResponsiveContainer && BarChart && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData.slice(0, 10)}>
                  {XAxis && <XAxis dataKey="name" hide />}
                  {YAxis && <YAxis />}
                  {Tooltip && <Tooltip />}
                  {Bar && (
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Referring Clinicians</CardTitle>
          </CardHeader>
          <CardContent>
            {ResponsiveContainer && BarChart && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={
                    analytics?.clinicians?.slice(0, 10).map((c) => ({
                      name: c.value ?? "Unknown",
                      count: c._count.value,
                    })) ?? []
                  }
                >
                  {XAxis && <XAxis dataKey="name" hide />}
                  {YAxis && <YAxis />}
                  {Tooltip && <Tooltip />}
                  {Bar && (
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Counties Generating Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {ResponsiveContainer && BarChart && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={
                    analytics?.counties?.slice(0, 10).map((c) => ({
                      name: c.value ?? "Unknown",
                      count: c._count.value,
                    })) ?? []
                  }
                >
                  {XAxis && <XAxis dataKey="name" hide />}
                  {YAxis && <YAxis />}
                  {Tooltip && <Tooltip />}
                  {Bar && (
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Source Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {ResponsiveContainer && PieChart && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  {Pie && (
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((_, index) =>
                        Cell ? (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ) : null
                      )}
                    </Pie>
                  )}
                  {Tooltip && <Tooltip />}
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion-to-Admission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {analytics?.conversion?.conversionRate ?? 0}%
            </p>
            <p className="text-sm text-muted-foreground">
              Converted referrals this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Time to Admission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-yellow-600">
              {analytics?.avgTime?.averageDays ?? "0.0"} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payer Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {ResponsiveContainer && PieChart && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  {Pie && (
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((_, index) =>
                        Cell ? (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ) : null
                      )}
                    </Pie>
                  )}
                  {Tooltip && <Tooltip />}
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discharge Disposition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monthly total discharges:{" "}
              {analytics?.discharge?.reduce(
                (sum, d) => sum + (d.total ?? 0),
                0
              ) ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outreach Activity Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent outreach activities correlated with referral spikes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emerging Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              New or low-frequency facilities beginning to refer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
