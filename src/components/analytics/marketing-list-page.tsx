import type { LiaisonAnalyticsCardData } from "@/lib/types";
import { mapAIAnalysisToInsights } from "@/lib/utils";
import { getMarketingList } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";

import { getLiaisons } from "@/services/options/options-service";
import { Button } from "../ui/button";
import { DateRangeFilter } from "../ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import LoadingSkeleton from "../ui/skeleton-loader";
import { AIInsights } from "./ai-insights";
import { LiaisonAnalyticsCard } from "./analytics-card";

type Filters = {
  start: Date | null;
  end: Date | null;
  userId: string | null;
};

const MarketingListPage = () => {
  /* UI-only filters */
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    start: null,
    end: null,
    userId: null,
  });

  /* Applied filters (TRIGGERS FETCH) */
  const [filters, setFilters] = useState<Filters>({
    start: null,
    end: null,
    userId: null,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["marketing-lead-analytics", filters],
    queryFn: () => getMarketingList(filters.start, filters.end, filters.userId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: liaisons = [] } = useQuery({
    queryKey: ["liaisons"],
    queryFn: () => getLiaisons(true),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const handleExportPDF = async () => {
    const element = document.getElementById("marketing-analytics-pdf");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      onclone: (doc) => {
        doc.querySelectorAll("svg").forEach((svg) => svg.remove());
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

    pdf.save("marketing-analytics.pdf");
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Marketing Lead Analytics</h1>
              <p className="text-sm text-gray-600">
                Track performance, insights, and engagement metrics
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Date Range */}
              <DateRangeFilter
                from={pendingFilters.start}
                to={pendingFilters.end}
                onChange={(range: { from: Date | null; to: Date | null }) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    start: range.from,
                    end: range.to,
                  }))
                }
              />

              {/* Liaison */}
              <Select
                value={pendingFilters.userId ?? undefined}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    userId: value,
                  }))
                }
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Select a liaison" />
                </SelectTrigger>
                <SelectContent>
                  {liaisons.map((liaison) => (
                    <SelectItem key={liaison.id} value={liaison.id}>
                      {liaison.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Apply */}
              <Button onClick={() => setFilters(pendingFilters)}>
                Apply Filters
              </Button>

              {/* Export */}
              <Button
                onClick={handleExportPDF}
                disabled={!filters.start || !filters.end || !data}
              >
                Export to PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 space-y-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="text-red-500">{(error as Error).message}</div>
        ) : (
          <div id="marketing-analytics-pdf" className="space-y-8">
            <AIInsights insights={mapAIAnalysisToInsights(data?.analysis)} />

            <div>
              <h2 className="text-xl font-bold mb-4">
                Liaison Performance Overview
              </h2>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.analytics?.map((liaison: LiaisonAnalyticsCardData) => (
                  <LiaisonAnalyticsCard key={liaison.memberId} data={liaison} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingListPage;
