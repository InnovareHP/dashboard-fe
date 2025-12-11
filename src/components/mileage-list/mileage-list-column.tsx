import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { EditableMileageCell } from "./editable-mileage-cell";

type MileageLogRow = {
  id: string;
  destination: string;
  countiesMarketed: string;
  beginningMileage: number;
  endingMileage: number;
  totalMiles: number;
  rateType: string;
  ratePerMile: number;
  reimbursementAmount: number;
};

export function generateMileageColumns(): ColumnDef<MileageLogRow>[] {
  const selectColumn: ColumnDef<MileageLogRow> = {
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

  const destinationColumn: ColumnDef<MileageLogRow> = {
    header: "Destination",
    accessorKey: "destination",
    cell: ({ row }) => (
      <EditableMileageCell
        id={row.original.id}
        fieldName="destination"
        value={row.original.destination}
        type="TEXT"
      />
    ),
  };

  const countiesMarketedColumn: ColumnDef<MileageLogRow> = {
    header: "Counties Marketed",
    accessorKey: "countiesMarketed",
    cell: ({ row }) => (
      <EditableMileageCell
        id={row.original.id}
        fieldName="countiesMarketed"
        value={row.original.countiesMarketed}
        type="TEXT"
      />
    ),
  };

  const beginningMileageColumn: ColumnDef<MileageLogRow> = {
    header: "Beginning Mileage",
    accessorKey: "beginningMileage",
    cell: ({ row }) => (
      <EditableMileageCell
        id={row.original.id}
        fieldName="beginningMileage"
        value={String(row.original.beginningMileage)}
        type="NUMBER"
        rowData={{
          beginningMileage: row.original.beginningMileage,
          endingMileage: row.original.endingMileage,
          rateType: row.original.rateType,
        }}
      />
    ),
  };

  const endingMileageColumn: ColumnDef<MileageLogRow> = {
    header: "Ending Mileage",
    accessorKey: "endingMileage",
    cell: ({ row }) => (
      <EditableMileageCell
        id={row.original.id}
        fieldName="endingMileage"
        value={String(row.original.endingMileage)}
        type="NUMBER"
        rowData={{
          beginningMileage: row.original.beginningMileage,
          endingMileage: row.original.endingMileage,
          rateType: row.original.rateType,
        }}
      />
    ),
  };

  const totalMilesColumn: ColumnDef<MileageLogRow> = {
    header: "Total Miles",
    accessorKey: "totalMiles",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.totalMiles}</span>
    ),
  };

  const rateTypeColumn: ColumnDef<MileageLogRow> = {
    header: "Rate Type",
    accessorKey: "rateType",
    cell: ({ row }) => (
      <EditableMileageCell
        id={row.original.id}
        fieldName="rateType"
        value={row.original.rateType}
        type="DROPDOWN"
        rowData={{
          beginningMileage: row.original.beginningMileage,
          endingMileage: row.original.endingMileage,
          rateType: row.original.rateType,
        }}
      />
    ),
  };

  const ratePerMileColumn: ColumnDef<MileageLogRow> = {
    header: "Rate Per Mile",
    accessorKey: "ratePerMile",
    cell: ({ row }) => (
      <span className="text-sm">${row.original.ratePerMile.toFixed(2)}</span>
    ),
  };

  const reimbursementAmountColumn: ColumnDef<MileageLogRow> = {
    header: "Reimbursement Amount",
    accessorKey: "reimbursementAmount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ${row.original.reimbursementAmount.toFixed(2)}
      </span>
    ),
  };

  return [
    selectColumn,
    destinationColumn,
    countiesMarketedColumn,
    beginningMileageColumn,
    endingMileageColumn,
    totalMilesColumn,
    rateTypeColumn,
    ratePerMileColumn,
    reimbursementAmountColumn,
  ];
}

