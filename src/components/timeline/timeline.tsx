"use client";

import { leadTimelineCollection } from "@/collection/leads/lead-collection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { LeadHistoryItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import type { Member } from "better-auth/plugins/organization";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ActivityAction from "./activity-action";

export default function LeadHistoryTimeline({
  history,
}: {
  history: LeadHistoryItem[];
}) {
  const [open, setOpen] = useState(false);
  const [newActivity, setNewActivity] = useState("");

  const qc = useQueryClient();

  const user = qc.getQueryData(["user-member"]) as Member;

  const groupedByMonth = history.reduce(
    (acc, item) => {
      const month = new Date(item.created_at).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      (acc[month] ||= []).push(item);
      return acc;
    },
    {} as Record<string, LeadHistoryItem[]>
  );

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;

    leadTimelineCollection.insert([
      {
        id: uuidv4(),
        created_at: new Date(),
        created_by: user?.id,
        action: "create",
        old_value: "",
        new_value: newActivity,
      },
    ]);
  };

  return (
    <div className="bg-background text-foreground p-6 rounded-lg min-h-[80vh] space-y-8">
      {/* ➕ Add Activity Button */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Activity
            </Button>
          </DialogTrigger>

          {/* Modal */}
          <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Add Activity
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Write a note or log an activity..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
                rows={4}
              />

              <Button
                onClick={handleAddActivity}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-md"
              >
                Save Activity
              </Button>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedByMonth).map(([month, items]) => (
        <div key={month} className="space-y-4">
          <div className="flex justify-center mt-4 mb-6">
            <div className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground font-medium">
              {month}
            </div>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} className="relative flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {idx !== items.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg p-4 flex-1 hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{item.created_by}</p>

                      {item.action === "update" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Updated {item.action} from{" "}
                          <span className="text-destructive">
                            "{item.old_value}"
                          </span>{" "}
                          →{" "}
                          <span className="text-green-500">
                            "{item.new_value}"
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(item.created_at.toISOString())}
                      </span>
                      <ActivityAction />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
