import { EditableCell } from "@/components/reusable-table/editable-cell";
import { type ColumnDef } from "@tanstack/react-table";
import { CreateColumnModal } from "../reusable-table/create-column";
import { Checkbox } from "../ui/checkbox";

type ColumnType = {
  id: string;
  name: string;
  type: string;
};

type ReferralRow = {
  id: string;
  lead_name: string;
  [key: string]: any;
};

export function generateReferralColumns(
  columnsFromApi: ColumnType[]
): ColumnDef<ReferralRow>[] {
  const dynamicColumns: ColumnDef<ReferralRow>[] = columnsFromApi.map(
    (col) => ({
      header: col.name,
      accessorKey: col.name, // column name from API
      cell: ({ row }) => (
        <EditableCell
          isReferral={true}
          id={row.original.id}
          fieldKey={col.id}
          fieldName={col.name}
          value={row.original[col.name] ?? ""}
          type={col.type}
        />
      ),
    })
  );

  const selectColumn: ColumnDef<ReferralRow> = {
    id: "select",
    header: () => <div className="px-4"></div>,
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

  //   const leadNameColumn: ColumnDef<LeadRow> = {
  //     header: "Lead Name",
  //     accessorKey: "lead_name",
  //     cell: ({ row }) => (
  //       <EditableCell
  //         leadId={row.original.id}
  //         fieldKey="lead_name"
  //         value={row.original.lead_name}
  //         type="TEXT"
  //       />
  //     ),
  //   };

  const createNewColumn: ColumnDef<ReferralRow> = {
    header: () => <CreateColumnModal isReferral={true} />,
    accessorKey: "create_column",
  };

  return [selectColumn, ...dynamicColumns, createNewColumn];
}
