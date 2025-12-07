import { format } from "date-fns";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CalendarIcon } from "lucide-react";

import type { AnalyticsResponse } from "@/lib/types";
import {
  getAnalytics,
  getAnalyticsSummary,
} from "@/services/analytics/analytics-service";

import { useQuery } from "@tanstack/react-query";
import * as Recharts from "recharts";
import AiSumary from "./ai-sumary";

function DateRangeFilter({
  onChange,
}: {
  onChange: (value: { start: Date | null; end: Date | null }) => void;
}) {
  const [date, setDate] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const handleSelect = (selected: any) => {
    setDate(selected);
    onChange(selected);
  };

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[260px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.start ? (
              date.end ? (
                <>
                  {format(date.start, "LLL dd, y")} —{" "}
                  {format(date.end, "LLL dd, y")}
                </>
              ) : (
                format(date.start, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: date.start ?? undefined,
              to: date.end ?? undefined,
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function ReferralAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  // MAIN ANALYTICS (runs when date range exists)
  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      const start = dateRange.start ? dateRange.start.toISOString() : null;
      const end = dateRange.end ? dateRange.end.toISOString() : null;
      return (await getAnalytics(start, end)) as AnalyticsResponse;
    },
  });

  // AI SUMMARY (runs ONLY when analytics is done)
  const { data: analyticsSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["analyticsSummary", analytics?.analytics],
    enabled: !!analytics,

    queryFn: async () => {
      return await getAnalyticsSummary(analytics ?? ({} as AnalyticsResponse));
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
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Behavioral Health Referral Intelligence
        </h1>
        <p className="text-muted-foreground mt-2">
          Track key outreach and referral performance metrics.
        </p>
      </div>

      {/* DATE FILTER */}
      <div className="flex flex-wrap items-center gap-4">
        <DateRangeFilter
          onChange={(range) => {
            setDateRange(range);
            refetchAnalytics();
          }}
        />
      </div>

      {/* AI SUMMARY CARD */}
      <AiSumary
        isLoadingSummary={isLoadingSummary}
        summary={analyticsSummary}
      />

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Top Facilities */}
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

        {/* Clinicians */}
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

        {/* Counties */}
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

        {/* Referral Source Breakdown */}
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

        {/* Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion-to-Admission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600">
              {analytics?.conversion?.conversionRate ?? 0}%
            </p>
            <p className="text-sm text-muted-foreground">
              Converted referrals this period
            </p>
          </CardContent>
        </Card>

        {/* Time to Admission */}
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

        {/* Payer Mix */}
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

        {/* Discharge */}
        <Card>
          <CardHeader>
            <CardTitle>Discharge Disposition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total discharges:{" "}
              {analytics?.discharge?.reduce(
                (sum, d) => sum + (d.total ?? 0),
                0
              ) ?? 0}
            </p>
          </CardContent>
        </Card>

        {/* Outreach Impact */}
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

        {/* Emerging Sources */}
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
