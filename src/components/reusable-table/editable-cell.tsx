import { leadCollection } from "@/collection/leads/lead-collection";
import { referralCollection } from "@/collection/referral/referral-collection";
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
import {
  createDropdownOption,
  getDropdownOptions,
} from "@/services/lead/lead-service";
import {
  createReferralDropdownOption,
  getReferralDropdownOptions,
} from "@/services/referral/referral-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import LocationCell from "./location-cell";
import { StatusSelect } from "./status-action";

type EditableCellProps = {
  id: string;
  fieldKey: string;
  fieldName: string;
  value: string;
  type: string; // Should match FieldType enum
  isReferral?: boolean;
};

export function EditableCell({
  id,
  fieldKey,
  fieldName,
  value,
  type,
  isReferral = false,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleUpdate = (
    newVal: string,
    location?: boolean,
    reason?: string
  ) => {
    if (!newVal || newVal === value) return;
    setVal(newVal);

    try {
      if (isReferral) {
        referralCollection.update(id, (draft) => {
          draft.field_id = fieldKey;
          draft.value = newVal;
          draft.reason = reason || "";
        });
      } else if (location) {
        leadCollection.update(id, (draft) => {
          draft.field_id = fieldKey;
          draft.value = JSON.stringify(newVal);
        });
      } else {
        leadCollection.update(id, (draft) => {
          draft.field_id = fieldKey;
          draft.value = newVal;
        });
      }
      toast.success("Value updated successfully");
    } catch (error) {
      toast.error("Failed to update value");
    }
  };

  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newOption, setNewOption] = useState("");

  const queryKey = ["dropdown-options", fieldKey];

  const { data: options = [], refetch } = useQuery({
    queryKey,
    queryFn: () =>
      isReferral
        ? getReferralDropdownOptions(fieldKey)
        : getDropdownOptions(fieldKey),
    enabled: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    gcTime: 1000 * 60 * 5,
  });

  const { mutate: createDropdownOptionMutation } = useMutation({
    mutationFn: async (option: string) =>
      isReferral
        ? createReferralDropdownOption(fieldKey, option)
        : createDropdownOption(fieldKey, option),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      refetch();
    },
  });

  const handleHover = async () => {
    const existing = queryClient.getQueryData(queryKey);

    if (!existing) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () =>
          isReferral
            ? getReferralDropdownOptions(fieldKey)
            : getDropdownOptions(fieldKey),
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
      <StatusSelect
        val={val}
        handleUpdate={(v, reason) => handleUpdate(v, undefined, reason)}
      />
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
      <Link to={`${isReferral ? "referral" : "leads"}/${id}/timeline` as any}>
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
    const hasCurrentVal = !!val && !options.some((opt) => opt.value === val);

    return (
      <Select defaultValue={val} onValueChange={(v) => handleUpdate(String(v))}>
        <SelectTrigger
          className="w-[140px] text-sm"
          onMouseEnter={handleHover} // prefetch before opening
        >
          <SelectValue placeholder={val || "Select an option"} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.value}>
              {opt.value}
            </SelectItem>
          ))}

          {hasCurrentVal && (
            <SelectItem key="current-val" value={val}>
              {val}
            </SelectItem>
          )}

          <div className="border-t my-1" />

          {fieldName !== "County" ? (
            <>
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
            </>
          ) : (
            <Link to={"county-config" as string}>
              <Button variant="ghost" className="w-full text-xs text-blue-600">
                + County Config
              </Button>
            </Link>
          )}
        </SelectContent>
      </Select>
    );
  }

  if (type === "LOCATION") {
    return (
      <LocationCell
        value={String(value || "")}
        onChange={(newLocation) => handleUpdate(String(newLocation), true)}
      />
    );
  }

  if (type === "MULTISELECT") {
    const parseValue = (val: string): string[] => {
      if (!val) return [];
      try {
        // If it's valid JSON, parse it
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed))
          return [...new Set(parsed.map((v) => String(v).trim()))];
      } catch {
        // Fallback: treat as comma-separated string
        return [
          ...new Set(
            val
              .replace(/[\[\]\\"]/g, "") // remove [ ], \, "
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          ),
        ];
      }
      return [];
    };

    const [selectedValues, setSelectedValues] = useState<string[]>(
      parseValue(val)
    );
    const [open, setOpen] = useState(false);

    const toggleValue = (optionValue: string) => {
      setSelectedValues((prev) => {
        const isSelected = prev.includes(optionValue);
        const updated = isSelected
          ? prev.filter((v) => v !== optionValue)
          : [...prev, optionValue];
        return [...new Set(updated)]; // deduplicate
      });
    };

    const handlePopoverChange = (nextOpen: boolean) => {
      if (!nextOpen) {
        // Save only when popover closes
        handleUpdate(selectedValues.join(","));
      }
      setOpen(nextOpen);
    };

    return (
      <Popover open={open} onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-auto justify-between text-left text-sm"
            onMouseEnter={handleHover}
          >
            {selectedValues.length > 0
              ? selectedValues.join(", ")
              : "Select options"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[180px] p-2" align="start">
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded-sm px-2 py-1"
                onClick={() => toggleValue(opt.value)}
              >
                <Checkbox checked={selectedValues.includes(opt.value)} />
                <span className="text-sm">{opt.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t my-2" />

          {adding ? (
            <div className="flex items-center gap-2 px-1">
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
        </PopoverContent>
      </Popover>
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
  return editing && fieldName !== "Facility" ? (
    <Input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      className="h-8 text-sm w-auto"
      autoFocus
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-sm hover:underline flex items-center gap-1 w-auto"
    >
      {val || <span className="text-muted-foreground">—</span>}
    </span>
  );
}
