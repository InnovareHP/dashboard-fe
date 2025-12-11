import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateMileageLog } from "@/services/mileage/mileage-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MileageRateType } from "../mileage-log/mileage-log-page";

const FEDERAL_RATE = 0.67;
const STATE_RATE = 0.5;

type EditableMileageCellProps = {
  id: string;
  fieldName: string;
  value: string;
  type: "TEXT" | "NUMBER" | "DROPDOWN";
  rowData?: {
    beginningMileage: number;
    endingMileage: number;
    rateType: string;
  };
};

export function EditableMileageCell({
  id,
  fieldName,
  value,
  type,
  rowData,
}: EditableMileageCellProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const queryClient = useQueryClient();

  const updateMileageMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: string;
      value: string | number;
    }) => {
      const updateData: any = {};
      updateData[field] = type === "NUMBER" ? Number(value) : value;

      // Calculate derived fields if needed
      if (rowData && (field === "beginningMileage" || field === "endingMileage" || field === "rateType")) {
        const beginningMileage =
          field === "beginningMileage" ? Number(value) : rowData.beginningMileage;
        const endingMileage =
          field === "endingMileage" ? Number(value) : rowData.endingMileage;
        const rateType =
          field === "rateType" ? String(value) : rowData.rateType;

        const totalMiles =
          endingMileage >= beginningMileage
            ? endingMileage - beginningMileage
            : 0;

        const ratePerMile =
          rateType === "FEDERAL"
            ? FEDERAL_RATE
            : rateType === "STATE"
              ? STATE_RATE
              : 0;

        const reimbursementAmount = Number((totalMiles * ratePerMile).toFixed(2));

        updateData.totalMiles = totalMiles;
        updateData.ratePerMile = ratePerMile;
        updateData.reimbursementAmount = reimbursementAmount;
      }

      return await updateMileageLog(id, updateData);
    },
    onMutate: async ({ id, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["mileage-logs"] });
      const previousData = queryClient.getQueryData(["mileage-logs"]);
      queryClient.setQueryData(["mileage-logs"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((r: any) => {
              if (r.id !== id) return r;

              const updatedRow = { ...r, [field]: value };

              // Calculate derived fields if needed
              if (
                rowData &&
                (field === "beginningMileage" ||
                  field === "endingMileage" ||
                  field === "rateType")
              ) {
                const beginningMileage =
                  field === "beginningMileage"
                    ? Number(value)
                    : updatedRow.beginningMileage;
                const endingMileage =
                  field === "endingMileage"
                    ? Number(value)
                    : updatedRow.endingMileage;
                const rateType =
                  field === "rateType" ? String(value) : updatedRow.rateType;

                const totalMiles =
                  endingMileage >= beginningMileage
                    ? endingMileage - beginningMileage
                    : 0;

                const ratePerMile =
                  rateType === "FEDERAL"
                    ? FEDERAL_RATE
                    : rateType === "STATE"
                      ? STATE_RATE
                      : 0;

                const reimbursementAmount = Number(
                  (totalMiles * ratePerMile).toFixed(2)
                );

                updatedRow.totalMiles = totalMiles;
                updatedRow.ratePerMile = ratePerMile;
                updatedRow.reimbursementAmount = reimbursementAmount;
              }

              return updatedRow;
            }),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _vars, context: any) => {
      queryClient.setQueryData(["mileage-logs"], context.previousData);
      toast.error("Failed to update mileage log.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-logs"] });
    },
  });

  const handleUpdate = async (newVal: string | number) => {
    if (!newVal || newVal === value) return;
    setVal(String(newVal));

    try {
      updateMileageMutation.mutate({
        id,
        field: fieldName,
        value: newVal,
      });
      toast.success("Value updated successfully");
    } catch (error) {
      toast.error("Failed to update value");
    }
  };

  const handleBlur = () => {
    setEditing(false);
    handleUpdate(val);
  };

  // ---- DROPDOWN (for rateType) ----
  if (type === "DROPDOWN") {
    return (
      <Select
        defaultValue={val}
        onValueChange={(v) => handleUpdate(String(v))}
      >
        <SelectTrigger className="w-auto text-sm">
          <SelectValue placeholder={val || "Select rate type"} />
        </SelectTrigger>
        <SelectContent>
          {MileageRateType.map((rate) => (
            <SelectItem key={rate} value={rate}>
              {rate === "FEDERAL" ? "Federal" : "State"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        className="h-8 text-sm w-auto"
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
      className="h-8 text-sm w-auto"
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

