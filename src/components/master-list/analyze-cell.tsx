import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getLeadAnalysis } from "@/services/lead/lead-service";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lead-analysis", leadId],
    queryFn: () => getLeadAnalysis(leadId),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const getEngagementConfig = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high":
        return {
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          text: "text-emerald-700",
          icon: TrendingUp,
          dot: "bg-emerald-500",
        };
      case "medium":
        return {
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          text: "text-amber-700",
          icon: BarChart3,
          dot: "bg-amber-500",
        };
      case "low":
        return {
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          text: "text-rose-700",
          icon: AlertCircle,
          dot: "bg-rose-500",
        };
      default:
        return {
          badge: "bg-gray-50 text-gray-700 border-gray-200",
          text: "text-gray-700",
          icon: BarChart3,
          dot: "bg-gray-500",
        };
    }
  };

  const getTouchpointIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("email")) return Mail;
    if (lowerType.includes("call") || lowerType.includes("phone")) return Phone;
    if (lowerType.includes("meeting") || lowerType.includes("visit"))
      return Video;
    if (lowerType.includes("event")) return Calendar;
    return MessageSquare;
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
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Analyze
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Custom Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BarChart3 className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Organization Analysis
                  </DialogTitle>
                  {data && (
                    <p className="text-sm text-gray-600 mt-0.5">
                      {data.leadName || data.leadId}
                    </p>
                  )}
                </div>
              </div>
              <DialogDescription className="text-sm text-gray-600">
                Comprehensive insights and engagement metrics
                {(dateStart || dateEnd) && (
                  <span className="text-blue-600 font-medium ml-2">
                    • {dateStart || "Start"} to {dateEnd || "End"}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          {isLoading ? (
            <div className="py-8">
              <LoadingSkeleton />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-red-50 mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-red-600 font-medium">
                {error instanceof Error
                  ? error.message
                  : "Failed to load analysis"}
              </p>
            </div>
          ) : data ? (
            <>
              {!hasSufficientData(data) ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-6 rounded-2xl bg-slate-50 mb-4">
                    <ClipboardList className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Insufficient Data
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md">
                    There aren't enough interactions or touchpoints recorded in
                    the specified date range to generate a meaningful analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 py-6">
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Engagement Level */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Engagement
                          </p>
                          {(() => {
                            const config = getEngagementConfig(
                              data.summary.engagementLevel
                            );
                            const EngagementIcon = config.icon;
                            return (
                              <EngagementIcon
                                className={`h-4 w-4 ${config.text}`}
                              />
                            );
                          })()}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            getEngagementConfig(data.summary.engagementLevel)
                              .badge
                          }
                        >
                          {data.summary.engagementLevel}
                        </Badge>
                      </CardContent>
                    </Card>

                    {/* Total Interactions */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Total Interactions
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {data.summary.totalInteractions}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Assigned To */}
                    <Card className="border-2">
                      <CardContent className="p-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Assigned To
                        </p>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {data.assignedTo}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Executive Summary */}
                  <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-gray-700">
                        {data.summary.narrative}
                      </p>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Detailed Metrics Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Touchpoints */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <BarChart3 className="h-4 w-4 text-indigo-600" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900">
                          Touchpoints
                        </h4>
                      </div>

                      {data.summary.touchpointsUsed.length > 0 ? (
                        <div className="space-y-2">
                          {data.summary.touchpointsUsed.map((tp) => {
                            const Icon = getTouchpointIcon(tp.type);
                            return (
                              <div
                                key={tp.type}
                                className="flex items-center justify-between p-3 rounded-lg border-2 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="h-4 w-4 text-indigo-600" />
                                  <span className="text-sm font-medium text-gray-700 capitalize">
                                    {tp.type.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                                  {tp.count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic p-4 bg-slate-50 rounded-lg">
                          No touchpoints recorded in this range.
                        </p>
                      )}
                    </div>

                    {/* Facilities & People */}
                    <div className="space-y-6">
                      {/* Facilities */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900">
                            Facilities Covered
                          </h4>
                          <Badge
                            variant="outline"
                            className="ml-auto bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {data.summary.facilitiesCovered.length}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg min-h-[3rem]">
                          {data.summary.facilitiesCovered.length > 0 ? (
                            data.summary.facilitiesCovered.map((facility) => (
                              <Badge
                                key={facility}
                                variant="secondary"
                                className="bg-white border-2 font-medium"
                              >
                                {facility}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              No facilities recorded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* People Contacted */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-purple-50">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="text-base font-bold text-gray-900">
                            Stakeholders
                          </h4>
                          <Badge
                            variant="outline"
                            className="ml-auto bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {data.summary.peopleContacted.length}
                          </Badge>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg min-h-[3rem]">
                          {data.summary.peopleContacted.length > 0 ? (
                            <ul className="space-y-2">
                              {data.summary.peopleContacted.map((person) => (
                                <li
                                  key={person}
                                  className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                                  <span className="font-medium">{person}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              No stakeholders recorded
                            </span>
                          )}
                        </div>
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
