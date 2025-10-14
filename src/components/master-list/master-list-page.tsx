import { leadCollection } from "@/collection/leads/lead-collection";
import LeadTableColumns from "@/components/master-list/master-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import { useLiveQuery } from "@tanstack/react-db";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export default function MasterListPage() {
  const { columns } = LeadTableColumns();
  const { data } = useLiveQuery(leadCollection);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <ReusableTable
      table={table}
      columns={columns}
      isFetchingList={false}
      setActivePage={() => {}}
    />
  );
}
