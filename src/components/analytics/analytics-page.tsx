import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsResponse } from "@/lib/types";
import { getAnalytics } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ReferralAnalyticsDashboard() {
  //   const queryClient = useQueryClient();
  //   const countiesQueryKey = ["counties"];

  //   const [filter, setFilter] = useState({ county: "All", range: null });

  //   const { data: counties } = useQuery<OptionsResponse[]>({
  //     queryKey: countiesQueryKey,
  //     queryFn: () => getOptionsCounties(),
  //   });

  //   const handleHover = async () => {
  //     const existing =
  //       queryClient.getQueryData<OptionsResponse[]>(countiesQueryKey);
  //     if (!existing) {
  //       await queryClient.prefetchQuery({
  //         queryKey: countiesQueryKey,
  //         queryFn: () => getOptionsCounties(),
  //       });
  //     }
  //   };

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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData.slice(0, 10)}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Referring Clinicians</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={
                  analytics?.clinicians?.slice(0, 10).map((c) => ({
                    name: c.value ?? "Unknown",
                    count: c._count.value,
                  })) ?? []
                }
              >
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Top 10 Counties Generating Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Counties Generating Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={
                  analytics?.counties?.slice(0, 10).map((c) => ({
                    name: c.value ?? "Unknown",
                    count: c._count.value,
                  })) ?? []
                }
              >
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Referral Source Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Source Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Conversion-to-Admission Rate */}
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

        {/* 6. Average Time from Referral to Admission */}
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

        {/* 7. Payer Source Mix */}
        <Card>
          <CardHeader>
            <CardTitle>Payer Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 8. Discharge Disposition */}
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

        {/* 9. Outreach Activity Impact */}
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

        {/* 10. Emerging Referral Sources */}
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
