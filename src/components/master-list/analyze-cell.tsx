import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getLeadAnalysis } from "@/services/lead/lead-service"; // Assuming this is where your fetch function lives
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Building2,
  ClipboardList,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
// Assuming LoadingSkeleton and other components are correctly imported
import { DateRangeFilter } from "../ui/date-range-filter";
import LoadingSkeleton from "../ui/skeleton-loader";

// --- Types (Ensure this matches the service layer) ---
export type LeadAnalyze = {
  leadId: string;
  leadName: string;
  assignedTo: string;
  summary: {
    totalInteractions: number;
    facilitiesCovered: string[];
    touchpointsUsed: { type: string; count: number }[];
    peopleContacted: string[];
    engagementLevel: string;
    narrative: string;
  };
};

interface AnalyzeLeadDialogProps {
  leadId: string;
  dateStart?: string;
  dateEnd?: string;
}

export function AnalyzeLeadDialog({
  leadId,
  dateStart,
  dateEnd,
}: AnalyzeLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateStart: dateStart,
    dateEnd: dateEnd,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lead-analysis", leadId, filters],
    queryFn: () => getLeadAnalysis(leadId, filters),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const getEngagementColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const hasSufficientData = (analysis: LeadAnalyze) => {
    if (!analysis || !analysis.summary) return false;

    if (analysis.summary.totalInteractions === 0) return false;

    const { facilitiesCovered, peopleContacted } = analysis.summary;
    if (facilitiesCovered.length === 0 && peopleContacted.length === 0)
      return false;

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analyze
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI Analysis
            {data && (
              <Badge variant="outline" className="font-normal text-xs">
                {data.leadName || data.leadId}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Deep dive insights and engagement summary.
            {/* Display date range prominently in the header */}
            {(dateStart || dateEnd) && (
              <p className="text-xs mt-1 text-primary">
                Filtered: {dateStart || "Start"} to {dateEnd || "End"}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error instanceof Error ? error.message : "Failed to load"}</p>
            </div>
          ) : data ? (
            <>
              {!hasSufficientData(data) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="bg-muted p-4 rounded-full">
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Insufficient Data</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    There aren't enough interactions or touchpoints recorded in
                    the specified date range to generate a meaningful analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <DateRangeFilter
                      from={
                        filters.dateStart ? new Date(filters.dateStart) : null
                      }
                      to={filters.dateEnd ? new Date(filters.dateEnd) : null}
                      onChange={(range) =>
                        setFilters({
                          dateStart: range.from
                            ? range.from.toISOString()
                            : undefined,
                          dateEnd: range.to
                            ? range.to.toISOString()
                            : undefined,
                        })
                      }
                    />
                    <Card className="md:col-span-2 bg-muted/30 border-none shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Executive Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {data.summary.narrative}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs uppercase text-muted-foreground">
                            Engagement
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Badge
                            className={`${getEngagementColor(
                              data.summary.engagementLevel
                            )} text-white border-none`}
                          >
                            {data.summary.engagementLevel}
                          </Badge>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs uppercase text-muted-foreground">
                            Assigned To
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {data.assignedTo}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* Metrics Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Touchpoints */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Touchpoints ({data.summary.totalInteractions} Total)
                      </h4>
                      {data.summary.touchpointsUsed.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {data.summary.touchpointsUsed.map((tp) => (
                            <div
                              key={tp.type}
                              className="flex justify-between items-center p-2 rounded-md border bg-card"
                            >
                              <span className="text-sm text-muted-foreground">
                                {tp.type}
                              </span>
                              <span className="font-mono font-bold">
                                {tp.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No touchpoints recorded in this range.
                        </p>
                      )}
                    </div>

                    {/* Facilities & People */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4" />
                          Facilities Covered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {data.summary.facilitiesCovered.length > 0 ? (
                            data.summary.facilitiesCovered.map((facility) => (
                              <Badge key={facility} variant="secondary">
                                {facility}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              None
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          Stakeholders
                        </h4>
                        <ul className="text-sm space-y-1">
                          {data.summary.peopleContacted.length > 0 ? (
                            data.summary.peopleContacted.map((person) => (
                              <li
                                key={person}
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                {person}
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-muted-foreground">
                              None
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
