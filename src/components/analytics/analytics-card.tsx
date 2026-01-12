import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { LiaisonAnalyticsCardData } from "@/lib/types";
import { Metric } from "./metrics";
import { Section } from "./section";

type Props = {
  data: LiaisonAnalyticsCardData;
};

export function LiaisonAnalyticsCard({ data }: Props) {
  const engagementColor = {
    Low: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-green-100 text-green-700",
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Liaison Performance
          </CardTitle>

          <Badge
            variant="outline"
            className={engagementColor[data.engagementLevel]}
          >
            {data.engagementLevel} Engagement
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground break-all">
          Member Name:{" "}
          {data.memberName === "" ? "Amy Cunningham" : data.memberName}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Interactions" value={data.totalInteractions} />
        </div>

        <Separator />

        {/* FACILITIES */}
        <Section
          title="Facilities Covered"
          emptyLabel="No facilities logged"
          items={data.facilitiesCovered}
        />

        {/* PEOPLE */}
        <Section
          title="People Contacted"
          emptyLabel="No contacts logged"
          items={data.peopleContacted}
        />

        {/* TOUCHPOINTS */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Touchpoints Used</p>

          {data.touchpointsUsed.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No touchpoints recorded
            </p>
          ) : (
            <div className="space-y-1">
              {data.touchpointsUsed.map((tp) => (
                <div key={tp.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tp.type.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{tp.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
