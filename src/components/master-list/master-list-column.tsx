import { EditableCell } from "@/components/reusable-table/editable-cell";
import { type ColumnDef } from "@tanstack/react-table";
import { CreateColumnModal } from "../reusable-table/create-column";
import { Checkbox } from "../ui/checkbox";

type ColumnType = {
  id: string;
  name: string;
  type: string;
};

type LeadRow = {
  id: string;
  lead_name: string;
  assigned_to: string;
  [key: string]: any;
};

export function generateLeadColumns(
  columnsFromApi: ColumnType[]
): ColumnDef<LeadRow>[] {
  const dynamicColumns: ColumnDef<LeadRow>[] = columnsFromApi.map((col) => ({
    id: col.id,
    header: col.name,
    accessorKey: col.name, // column name from API
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        fieldKey={col.id}
        fieldName={col.name}
        value={row.original[col.name] ?? ""}
        type={col.type}
      />
    ),
  }));

  const selectColumn: ColumnDef<LeadRow> = {
    id: "select",
    header: () => <div className="px-4">Select</div>,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const OrganizerColumn: ColumnDef<LeadRow> = {
    header: "Organization",
    accessorKey: "Organization",
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        fieldName="Organization"
        fieldKey="Lead"
        value={row.original.lead_name}
        type="TEXT"
      />
    ),
  };

  const AssignedToColumn: ColumnDef<LeadRow> = {
    header: "Account Manager",
    accessorKey: "assigned_to",
    cell: ({ row }) => (
      <EditableCell
        id={row.original.id}
        fieldName="Account Manager"
        fieldKey="ASSIGNED_TO"
        value={row.original.assigned_to}
        type="ASSIGNED_TO"
      />
    ),
  };

  const createNewColumn: ColumnDef<LeadRow> = {
    header: () => <CreateColumnModal />,
    id: "create_column",
    accessorKey: "create_column",
  };

  return [
    selectColumn,
    OrganizerColumn,
    AssignedToColumn,
    ...dynamicColumns,
    createNewColumn,
  ];
}
