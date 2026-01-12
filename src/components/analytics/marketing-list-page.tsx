import type { LiaisonAnalyticsCardData } from "@/lib/types";
import { mapAIAnalysisToInsights } from "@/lib/utils";
import { getMarketingList } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AIInsights } from "./ai-insights";
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

  const handleExportPDF = async () => {
    const element = document.getElementById("marketing-analytics-pdf");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,

      onclone: (doc) => {
        // 🚫 Remove ALL SVGs (Lucide icons use OKLCH)
        doc.querySelectorAll("svg").forEach((svg) => svg.remove());

        // 🧼 Force safe colors
        doc.querySelectorAll("*").forEach((el) => {
          const e = el as HTMLElement;
          e.style.color = "#000000";
          e.style.backgroundColor = "#ffffff";
          e.style.borderColor = "#e5e7eb";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`marketing-analytics.pdf`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen w-full space-y-6">
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

        <Button onClick={handleExportPDF} variant="default">
          Export to PDF
        </Button>
      </div>

      <div id="marketing-analytics-pdf" className="space-y-6 bg-white p-8">
        <AIInsights insights={mapAIAnalysisToInsights(data?.analysis)} />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.analytics?.map((liaison: LiaisonAnalyticsCardData) => (
            <LiaisonAnalyticsCard key={liaison.memberId} data={liaison} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingListPage;
