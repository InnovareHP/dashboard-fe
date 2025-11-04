import { leadCollection } from "@/collection/leads/lead-collection";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createDropdownOption, getDropdownOptions } from "@/services/lead/lead-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import LocationCell from "./location-cell";

type EditableCellProps = {
  leadId: string;
  fieldKey: string;
  value: string;
  type: string; // Should match FieldType enum
};

export function EditableCell({
  leadId,
  fieldKey,
  value,
  type,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleUpdate = (newVal: string, location?: boolean) => {
    if (!newVal || newVal === value) return;
    setVal(newVal);


    if (location) {

      leadCollection.update(leadId, (draft) => {
        draft.field_id = fieldKey;
        draft.value = JSON.stringify(newVal);
      });
    } else {
      leadCollection.update(leadId, (draft) => {
        draft.field_id = fieldKey;
        draft.value = newVal;
      });
    }
  };

  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newOption, setNewOption] = useState("");

  const queryKey = ["dropdown-options", fieldKey];

  const { data: options = [], isFetching,refetch } = useQuery({
    queryKey,
    queryFn: () => getDropdownOptions(fieldKey),
    enabled: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    gcTime: 1000 * 60 * 5,
  });

  const { mutate: createDropdownOptionMutation } = useMutation({
    mutationFn: async (option: string) => await createDropdownOption(fieldKey, option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      refetch()
    },
  });

  const handleHover = async () => {
    const existing = queryClient.getQueryData(queryKey);

    if (!existing) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => getDropdownOptions(fieldKey),
      });
    }
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;

    createDropdownOptionMutation(newOption.trim());


    setNewOption("");
    setAdding(false);
  };

  const handleBlur = () => {
    setEditing(false);
    handleUpdate(val);
  };

  // ---- STATUS ----
  if (type === "STATUS") {
    return (
      <Select
        defaultValue={val || "New Lead"}
        onValueChange={(v) => handleUpdate(v)}
      >
        <SelectTrigger className="w-[140px] text-sm">
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

  // ---- DATE ----
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
              "w-full justify-start text-left font-normal h-8 text-sm",
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
              handleUpdate(iso);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // ---- TIME ----
  if (type === "TIMELINE") {
    return (
      <Link to={`leads/${leadId}/timeline` as any}>
        <Button variant="secondary" className="h-8 text-sm">
          View Timeline
        </Button>
      </Link>
    );
  }

  // ---- CHECKBOX ----
  if (type === "CHECKBOX") {
    return (
      <Checkbox
        checked={val === "true"}
        onCheckedChange={(checked) => handleUpdate(checked ? "true" : "false")}
      />
    );
  }

  // ---- DROPDOWN ----
  if (type === "DROPDOWN") {
    return (
        <Select defaultValue={val} onValueChange={(v) => handleUpdate(v)}>
        <SelectTrigger
          className="w-[140px] text-sm"
          onMouseEnter={handleHover} // prefetches before opening
        >
          <SelectValue placeholder={val} />
        </SelectTrigger>

        <SelectContent>
          {isFetching ? (
            <div className="text-center text-xs text-muted-foreground py-2">
              Loading options...
            </div>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.value}
              </SelectItem>
            ))
          )}

          <div className="border-t my-1" />

          {adding ? (
            <div className="flex items-center gap-2 px-2 py-1">
              <Input
                placeholder="New option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleAddOption}
              >
                Add
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full text-xs text-blue-600"
              onClick={() => setAdding(true)}
            >
              + Add more option
            </Button>
          )}
        </SelectContent>
      </Select>
    );
  }

  if (type === "LOCATION") {
    return (
      <LocationCell
        value={String(value || "")}
        onChange={(newLocation) => handleUpdate(newLocation, true)}
      />
    );
  }

  // ---- NUMBER ----
  if (type === "NUMBER") {
    return editing ? (
      <Input
        type="number"
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
        className="cursor-pointer text-sm hover:underline"
      >
        {val || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }

  // ---- EMAIL ----
  if (type === "EMAIL") {
    return editing ? (
      <Input
        type="email"
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
        className="cursor-pointer text-sm hover:underline text-blue-500"
      >
        {val || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }

  // ---- PHONE ----
  if (type === "PHONE") {
    return editing ? (
      <Input
        type="tel"
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
        className="cursor-pointer text-sm hover:underline"
      >
        {val || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }

  // ---- TEXT (default) ----
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
    </span>
  );
}
