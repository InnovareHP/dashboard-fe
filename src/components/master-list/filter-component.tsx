import { useState } from "react";
import { Input } from "../ui/input";

export function FilterComponent({
  col,
  filterMeta,
  updateFilter,
}: {
  col: {
    id: string;
    name: string;
    type: string;
  };
  filterMeta: any;
  updateFilter: (name: string, value: any) => void;
}) {
  const [localValue, setLocalValue] = useState(
    filterMeta.filter[col.name] ?? ""
  );

  const handleBlur = () => {
    updateFilter(col.name, localValue || undefined);
  };

  switch (col.type) {
    case "TEXT":
    case "EMAIL":
    case "PHONE":
      return (
        <Input
          placeholder={`Filter by ${col.name}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
        />
      );

    case "NUMBER":
      return (
        <Input
          type="number"
          placeholder={`Filter by ${col.name}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() =>
            updateFilter(col.name, localValue ? Number(localValue) : undefined)
          }
        />
      );

    default:
      return (
        <Input
          placeholder={`Filter by ${col.name}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
        />
      );
  }
}
