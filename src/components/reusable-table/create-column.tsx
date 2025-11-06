"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createColumn } from "@/services/lead/lead-service";
import { createReferralColumn } from "@/services/referral/referral-service";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Hash,
  ListChecks,
  Mail,
  Phone,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateColumnModal({
  isReferral = false,
}: {
  isReferral?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!name) {
      toast.error("Please enter a column name");
      return;
    }

    setLoading(true);
    try {
      await (isReferral ? createReferralColumn : createColumn)(type, name);

      queryClient.invalidateQueries({
        queryKey: isReferral ? ["referrals-meta"] : ["leads-meta"],
      });

      toast.success("Column created successfully!");
      setOpen(false);
      setName("");
      setType("TEXT");
    } catch (err) {
      console.error(err);
      toast.error("Error creating column");
    } finally {
      setLoading(false);
    }
  };

  const fieldTypes = [
    { label: "Text", value: "TEXT", icon: <AlignLeft className="w-4 h-4" /> },
    { label: "Number", value: "NUMBER", icon: <Hash className="w-4 h-4" /> },
    {
      label: "Status",
      value: "STATUS",
      icon: <ListChecks className="w-4 h-4" />,
    },
    { label: "Email", value: "EMAIL", icon: <Mail className="w-4 h-4" /> },
    { label: "Phone", value: "PHONE", icon: <Phone className="w-4 h-4" /> },
    { label: "Date", value: "DATE", icon: <Calendar className="w-4 h-4" /> },
    {
      label: "Checkbox",
      value: "CHECKBOX",
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      label: "Dropdown",
      value: "DROPDOWN",
      icon: <ChevronDown className="w-4 h-4" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Column
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add a New Column</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Column Name */}
          <div>
            <Label className="text-sm font-medium">Column Name</Label>
            <Input
              placeholder="e.g. Last Interaction"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Column Type (Radio Group) */}
          <div>
            <Label className="text-sm font-medium">Column Type</Label>
            <RadioGroup
              value={type}
              onValueChange={setType}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2"
            >
              {fieldTypes.map((ft) => (
                <Label
                  key={ft.value}
                  htmlFor={ft.value}
                  className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer hover:bg-accent transition-all ${
                    type === ft.value
                      ? "border-primary bg-accent"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem id={ft.value} value={ft.value} />
                  {ft.icon}
                  <span className="text-sm">{ft.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
