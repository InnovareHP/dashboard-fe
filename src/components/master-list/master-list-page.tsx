import { generateLeadColumns } from "@/components/master-list/master-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import type { LeadRow } from "@/lib/types";
import { createLead, deleteLead, getLeads } from "@/services/lead/lead-service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { MasterListFilters } from "./master-list-filter";

export default function MasterListPage() {
  // Meta (date filters, dynamic filters, pagination size)
  const queryClient = useQueryClient();
  const [filterMeta, setFilterMeta] = useState({
    leadDateFrom: null,
    leadDateTo: null,
    filter: {},
    limit: 20,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["leads", filterMeta],
    queryFn: () => getLeads(filterMeta),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const columns = generateLeadColumns(data?.pages[0].columns ?? []) as {
    id: string;
    name: string;
    type: string;
  }[];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const addLeadMutation = useMutation({
    mutationFn: createLead,
    onMutate: async (newLead) => {
      await queryClient.cancelQueries({ queryKey: ["leads", filterMeta] });
      const previousData = queryClient.getQueryData(["leads", filterMeta]);
      queryClient.setQueryData(["leads", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newLead[0], ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      return { previousData };
    },
    onError: (_err, _newLead, context: any) => {
      queryClient.setQueryData(["leads", filterMeta], context.previousData);
      toast.error("Failed to add lead.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", filterMeta] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: deleteLead,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["leads", filterMeta] });
      const previousData = queryClient.getQueryData(["leads", filterMeta]);
      queryClient.setQueryData(["leads", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: { data: LeadRow[] }) => ({
            ...page,
            data: page.data.filter((r: LeadRow) => !ids.includes(r.id)),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _ids, context: any) => {
      queryClient.setQueryData(["leads", filterMeta], context.previousData);
      toast.error("Failed to delete leads.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", filterMeta] });
    },
  });

  const handleAddNewLead = () => {
    const newLead = [
      {
        id: uuidv4(),
        lead_name: "",
        status: "",
        activities_time: 0,
        create_contact: "",
        company: "",
        title: "",
        email: "",
        phone: "",
        last_interaction: "",
        active_sequences: 0,
      },
    ];
    addLeadMutation.mutate(newLead);
  };

  const handleDeleteLeads = (columnIds: string[]) => {
    deleteLeadMutation.mutate(columnIds);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Lead Master List</h2>

      <MasterListFilters
        columns={data?.pages[0].columns ?? []}
        filterMeta={filterMeta}
        refetch={refetch}
        setFilterMeta={setFilterMeta}
      />

      <ReusableTable
        table={table}
        columns={columns}
        isFetchingList={isFetchingNextPage || isFetching}
        onLoadMore={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        hasMore={hasNextPage}
        setActivePage={() => {}}
        onAdd={handleAddNewLead}
        onDelete={handleDeleteLeads}
      />
    </div>
  );
}
