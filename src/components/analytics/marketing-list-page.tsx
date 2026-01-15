import type { LiaisonAnalyticsCardData } from "@/lib/types";
import { mapAIAnalysisToInsights } from "@/lib/utils";
import { getMarketingList } from "@/services/analytics/analytics-service";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";

import { Button } from "../ui/button";
import { DateRangeFilter } from "../ui/date-range-filter";
import LoadingSkeleton from "../ui/skeleton-loader";
import { AIInsights } from "./ai-insights";
import { LiaisonAnalyticsCard } from "./analytics-card";

const MarketingListPage = () => {
  /* UI-selected range (NO FETCH) */
  const [selectedRange, setSelectedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });

  /* Applied range (TRIGGERS FETCH) */
  const [appliedRange, setAppliedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });

  /* ----------------------------------------
     React Query
  ---------------------------------------- */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["marketing-lead-analytics", appliedRange],
    queryFn: () => getMarketingList(appliedRange.start, appliedRange.end),
    staleTime: 1000 * 60 * 5,
  });

  /* ----------------------------------------
     PDF Export
  ---------------------------------------- */
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

  /* ----------------------------------------
     Render
  ---------------------------------------- */
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
              <DateRangeFilter
                from={
                  selectedRange.start ? new Date(selectedRange.start) : null
                }
                to={selectedRange.end ? new Date(selectedRange.end) : null}
                onChange={(range: { from: Date | null; to: Date | null }) =>
                  setSelectedRange({
                    start: range.from?.toISOString() ?? null,
                    end: range.to?.toISOString() ?? null,
                  })
                }
              />

              <Button
                onClick={() => {
                  if (!selectedRange.start || !selectedRange.end) return;
                  setAppliedRange(selectedRange);
                }}
                disabled={!selectedRange.start || !selectedRange.end}
              >
                Apply Date Range
              </Button>

              <Button
                onClick={handleExportPDF}
                disabled={!appliedRange.start || !appliedRange.end || !data}
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
