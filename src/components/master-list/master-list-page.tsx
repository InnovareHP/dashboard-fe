import { generateLeadColumns } from "@/components/master-list/master-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import { Button } from "@/components/ui/button";
import type { LeadRow, OptionsResponse } from "@/lib/types";
import { exportToCSV } from "@/lib/utils";
import { createLead, deleteLead, getLeads } from "@/services/lead/lead-service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { MasterListFilters } from "./master-list-filter";

export default function MasterListPage() {
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
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["leads", filterMeta],

    queryFn: ({ pageParam = filterMeta.limit }) =>
      getLeads({
        ...filterMeta,
        page: pageParam, // 👈 THIS is what fetchNextPage controls
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { page, limit, count } = lastPage.pagination;
      const totalPages = Math.ceil(count / limit);
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const columns = generateLeadColumns(data?.pages[0].columns ?? []) as {
    id: string;
    name: string;
    type: string;
  }[];

  // --- Table Instance ---
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // --- Mutations ---
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

  // --- Handlers ---
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

  const handleExportCSV = async () => {
    if (rows.length === 0) {
      toast.error("No leads available to export.");
      return;
    }

    const limit = 100;
    let offset = 0;
    let allData: LeadRow[] = [];

    let total = 0;
    let columns: any[] = [];
    let users: OptionsResponse[] =
      queryClient.getQueryData(["assigned-to-users"]) ?? [];

    do {
      const res = await getLeads({
        ...filterMeta,
        limit,
        offset,
      });

      if (offset === 0) {
        total = res.pagination.count;
        columns = res.columns;
      }

      columns = res.columns;
      allData = [...allData, ...res.data];
      offset += res.data.length;
    } while (offset < total);

    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(allData, columns, `Master_Leads_${timestamp}`, users);
    toast.success("CSV download started.");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Master Marketing List
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Visualize, filter, and export your marketing leads database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2 border-gray-300 bg-white"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleAddNewLead}
              className="flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        <div className="bg-white">
          <MasterListFilters
            columns={data?.pages[0].columns ?? []}
            filterMeta={filterMeta}
            refetch={refetch}
            setFilterMeta={setFilterMeta}
          />
        </div>

        {/* Table Wrapper */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <ReusableTable
            table={table}
            columns={columns}
            isFetchingList={isFetchingNextPage || isLoading}
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
      </div>
    </div>
  );
}
