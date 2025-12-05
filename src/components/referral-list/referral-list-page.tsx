import ReusableTable from "@/components/reusable-table/reusable-table";
import type { ReferralRow } from "@/lib/types";
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
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { MasterListFilters } from "../master-list/master-list-filter";
import { generateReferralColumns } from "./referral-list-column";

export default function ReferralListPage() {
  // Meta (date filters, dynamic filters, pagination size)
  const queryClient = useQueryClient();
  const [filterMeta, setFilterMeta] = useState({
    referralDateFrom: null,
    referralDateTo: null,
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Referral Master List</h2>

      <MasterListFilters
        columns={data?.pages[0].columns ?? []}
        filterMeta={filterMeta}
        refetch={refetch}
        setFilterMeta={setFilterMeta}
        isReferral={true}
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
        onAdd={handleAddNewReferral}
        onDelete={handleDeleteReferrals}
        isReferral={true}
      />
    </div>
  );
}
