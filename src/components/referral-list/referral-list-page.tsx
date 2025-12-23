import ReusableTable from "@/components/reusable-table/reusable-table";
import { Button } from "@/components/ui/button";
import type { ReferralRow } from "@/lib/types";
import { exportToCSV } from "@/lib/utils";
import {
  createReferral,
  deleteReferral,
  getReferral,
} from "@/services/referral/referral-service";
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
import { MasterListFilters } from "../master-list/master-list-filter";
import { generateReferralColumns } from "./referral-list-column";

export default function ReferralListPage() {
  const queryClient = useQueryClient();
  const [filterMeta, setFilterMeta] = useState({
    referralDateFrom: null,
    referralDateTo: null,
    filter: {},
    limit: 20,
  });

  // --- Data Fetching ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["referrals", filterMeta],
    queryFn: () => getReferral(filterMeta),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const columns = generateReferralColumns(data?.pages[0].columns ?? []) as {
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

  const addReferralMutation = useMutation({
    mutationFn: createReferral,
    onMutate: async (newReferral) => {
      await queryClient.cancelQueries({ queryKey: ["referrals", filterMeta] });
      const previousData = queryClient.getQueryData(["referrals", filterMeta]);
      queryClient.setQueryData(["referrals", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newReferral[0], ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      return { previousData };
    },
    onError: (_err, _newLead, context: any) => {
      queryClient.setQueryData(["referrals", filterMeta], context.previousData);
      toast.error("Failed to add lead.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", filterMeta] });
    },
  });

  const deleteReferralMutation = useMutation({
    mutationFn: deleteReferral,
    onMutate: async (columnIds) => {
      await queryClient.cancelQueries({ queryKey: ["referrals", filterMeta] });
      const previousData = queryClient.getQueryData(["referrals", filterMeta]);
      queryClient.setQueryData(["referrals", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: { data: ReferralRow[] }) => ({
            ...page,
            data: page.data.filter(
              (r: ReferralRow) => !columnIds.includes(r.id)
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _ids, context: any) => {
      queryClient.setQueryData(["referrals", filterMeta], context.previousData);
      toast.error("Failed to delete leads.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", filterMeta] });
    },
  });

  // --- Handlers ---
  const handleAddNewReferral = () => {
    const newReferral = [
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
    addReferralMutation.mutate(newReferral);
  };

  const handleDeleteReferrals = (columnIds: string[]) => {
    deleteReferralMutation.mutate(columnIds);
  };

  const handleExportCSV = async () => {
    if (rows.length === 0) {
      toast.error("No leads available to export.");
      return;
    }

    const limit = 100;
    let offset = 0;
    let allData: ReferralRow[] = [];

    let total = 0;
    let columns: any[] = [];

    do {
      const res = await getReferral({
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
    exportToCSV(allData, columns, `Referral_List_${timestamp}`, [], true);
    toast.success("CSV download started.");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Referral Master List
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your referrals and export data for reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2 border-gray-300 hover:bg-white hover:text-primary transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={handleAddNewReferral}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Referral
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white mb-6">
        <MasterListFilters
          columns={data?.pages[0].columns ?? []}
          filterMeta={filterMeta}
          refetch={refetch}
          setFilterMeta={setFilterMeta}
          isReferral={true}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
          onAdd={handleAddNewReferral}
          onDelete={handleDeleteReferrals}
          isReferral={true}
        />
      </div>
    </div>
  );
}
