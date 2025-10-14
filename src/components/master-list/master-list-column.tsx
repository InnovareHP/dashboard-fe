// components/master-list/master-list-column.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { EditableCell } from "../reusable-table/editable-cell";

const LeadTableColumns = () => {
  const columns: ColumnDef<any>[] = [
    {
      header: "Lead",
      accessorKey: "lead_name",
      cell: ({ row }) => (
        <EditableCell
          leadId={row.original.id}
          fieldKey="lead_name"
          value={row.original.lead_name}
          type="TEXT"
        />
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <EditableCell
          leadId={row.original.id}
          fieldKey="status"
          value={row.original.status}
          type="STATUS"
        />
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <EditableCell
          leadId={row.original.id}
          fieldKey="email"
          value={row.original.email}
          type="EMAIL"
        />
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: ({ row }) => (
        <EditableCell
          leadId={row.original.id}
          fieldKey="phone"
          value={row.original.phone}
          type="PHONE"
        />
      ),
    },
    {
      header: "Company",
      accessorKey: "company",
      cell: ({ row }) => (
        <EditableCell
          leadId={row.original.id}
          fieldKey="company"
          value={row.original.company}
          type="TEXT"
        />
      ),
    },
  ];

  return { columns };
};

export default LeadTableColumns;
