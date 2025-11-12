import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsResponse } from "@/lib/types";
import { getAnalytics } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Recharts component types
type RechartsComponents = {
  Bar: React.ComponentType<any>;
  BarChart: React.ComponentType<any>;
  Cell: React.ComponentType<any>;
  Pie: React.ComponentType<any>;
  PieChart: React.ComponentType<any>;
  ResponsiveContainer: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  XAxis: React.ComponentType<any>;
  YAxis: React.ComponentType<any>;
};

// Placeholder component when recharts is not available
const ChartPlaceholder = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground border border-dashed rounded">
    {message}
  </div>
);

export default function ReferralAnalyticsDashboard() {
  const [recharts, setRecharts] = useState<RechartsComponents | null>(null);

  useEffect(() => {
    // Dynamically import recharts
    const loadRecharts = async () => {
      try {
        // Construct module name dynamically to avoid Vite pre-bundling
        const moduleName = "re" + "charts";
        // @vite-ignore - recharts may not be installed
        const rechartsModule = await import(/* @vite-ignore */ moduleName);
        if (rechartsModule) {
          setRecharts({
            Bar: rechartsModule.Bar,
            BarChart: rechartsModule.BarChart,
            Cell: rechartsModule.Cell,
            Pie: rechartsModule.Pie,
            PieChart: rechartsModule.PieChart,
            ResponsiveContainer: rechartsModule.ResponsiveContainer,
            Tooltip: rechartsModule.Tooltip,
            XAxis: rechartsModule.XAxis,
            YAxis: rechartsModule.YAxis,
          });
        }
      } catch (error) {
        console.warn("recharts package not found. Charts will be disabled.");
        setRecharts(null);
      }
    };

    loadRecharts();
  }, []);

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

  // Extract recharts components for easier use
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
  } = recharts || {};

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

      <div className="flex flex-wrap items-center gap-4">
        {/* <Select
          onValueChange={(val) => setFilter((f) => ({ ...f, county: val }))}
        >
          <SelectTrigger onMouseEnter={handleHover} className="w-[180px]">
            <SelectValue placeholder="Filter by County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Counties</SelectItem>
            {counties?.map((c) => (
              <SelectItem key={c.value} value={c.value ?? "Unknown"}>
                {c.value ?? "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        {/* <DateRangePicker
          onUpdate={(values: { range: DateRange; rangeCompare?: DateRange }) =>
            setFilter((f) => ({ ...f, range: values.range ?? null }))
          }
        /> */}
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. Top 10 Referring Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Referring Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            {recharts && ResponsiveContainer && BarChart ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData.slice(0, 10)}>
                  {XAxis && <XAxis dataKey="name" hide />}
                  {YAxis && <YAxis />}
                  {Tooltip && <Tooltip />}
                  {Bar && <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="Install recharts to view charts" />
            )}
          </CardContent>
        </Card>

        {/* 2. Top 10 Referring Clinicians */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Referring Clinicians</CardTitle>
          </CardHeader>
          <CardContent>
            {recharts && ResponsiveContainer && BarChart ? (
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
                  {Bar && <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="Install recharts to view charts" />
            )}
          </CardContent>
        </Card>

        {/* 3. Top 10 Counties Generating Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Counties Generating Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {recharts && ResponsiveContainer && BarChart ? (
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
                  {Bar && <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="Install recharts to view charts" />
            )}
          </CardContent>
        </Card>

        {/* 4. Referral Source Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Source Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {recharts && ResponsiveContainer && PieChart ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  {Pie && (
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((_, index) => (
                        Cell ? <Cell key={index} fill={COLORS[index % COLORS.length]} /> : null
                      ))}
                    </Pie>
                  )}
                  {Tooltip && <Tooltip />}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="Install recharts to view charts" />
            )}
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
            {recharts && ResponsiveContainer && PieChart ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  {Pie && (
                    <Pie data={pieData} dataKey="value" outerRadius={80} label>
                      {pieData.map((_, index) => (
                        Cell ? <Cell key={index} fill={COLORS[index % COLORS.length]} /> : null
                      ))}
                    </Pie>
                  )}
                  {Tooltip && <Tooltip />}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="Install recharts to view charts" />
            )}
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
