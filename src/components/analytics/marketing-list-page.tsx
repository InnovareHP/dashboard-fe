"use client";

import type { LiaisonAnalyticsCardData } from "@/lib/types";
import { getMarketingList } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { LiaisonAnalyticsCard } from "./analytics-card";

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

const MarketingListPage = () => {
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["marketing-lead-analytics"],
    queryFn: () => getMarketingList(dateRange.start, dateRange.end),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">{(error as Error).message}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Marketing Lead Analytics</h1>

      <div className="flex flex-wrap items-center gap-4">
        <DateRangeFilter
          onChange={(range) => {
            setDateRange({
              start: range.start?.toISOString() ?? null,
              end: range.end?.toISOString() ?? null,
            });
            refetchAnalytics();
          }}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((liaison: LiaisonAnalyticsCardData) => (
          <LiaisonAnalyticsCard key={liaison.memberId} data={liaison} />
        ))}
      </div>
    </div>
  );
};

export default MarketingListPage;
