"use client";

import { leadCollection } from "@/collection/leads/lead-collection";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { useState } from "react";

type EditableCellProps = {
  leadId: string;
  fieldKey: string;
  value: string;
  type: string;
};

export function EditableCell({
  leadId,
  fieldKey,
  value,
  type,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleBlur = async () => {
    setEditing(false);
    leadCollection.update({ id: leadId }, (draft) => {
      draft[fieldKey] = val;
    });
  };

  // ---- STATUS (Dropdown) ----
  if (type === "STATUS") {
    return (
      <Select
        defaultValue={val || "New Lead"}
        onValueChange={(v) => {
          setVal(v);
          leadCollection.update({ id: leadId }, (draft) => {
            draft[fieldKey] = v;
          });
        }}
      >
        <SelectTrigger
          className={cn(
            "w-[140px] text-sm",
            leadCollection.isReady() && "opacity-50 cursor-wait"
          )}
        >
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New Lead">New Lead</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // ---- DATE (Calendar Picker) ----
  if (type === "DATE") {
    const [date, setDate] = useState<Date | undefined>(
      val ? new Date(val) : undefined
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              setDate(selectedDate);
              const iso = selectedDate.toISOString().split("T")[0];
              setVal(iso);
              leadCollection.update({ id: leadId }, (draft) => {
                draft[fieldKey] = iso;
              });
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // ---- TEXT (Inline Editable) ----
  return editing ? (
    <Input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      className="h-8 text-sm"
      autoFocus
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-sm hover:underline flex items-center gap-1"
    >
      {val || <span className="text-muted-foreground">—</span>}
      {val && <Check className="h-3 w-3 text-muted-foreground" />}
    </span>
  );
}
