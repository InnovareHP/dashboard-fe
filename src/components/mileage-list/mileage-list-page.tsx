import { generateMileageColumns } from "@/components/mileage-list/mileage-list-column";
import ReusableTable from "@/components/reusable-table/reusable-table";
import type { MileageLogRow } from "@/lib/types";
import {
    createMileageLog,
    deleteMileageLog,
    getMileageLogs,
} from "@/services/mileage/mileage-service";
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
import { MileageRateType } from "../mileage-log/mileage-log-page";

const FEDERAL_RATE = 0.67;

export default function MileageListPage() {
  const queryClient = useQueryClient();
  const [filterMeta, setFilterMeta] = useState({
    mileageDateFrom: null,
    mileageDateTo: null,
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
    queryKey: ["mileage-logs", filterMeta],
    queryFn: () => getMileageLogs(filterMeta),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  const columns = generateMileageColumns();

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const addMileageLogMutation = useMutation({
    mutationFn: createMileageLog,
    onMutate: async (newMileageLog) => {
      await queryClient.cancelQueries({ queryKey: ["mileage-logs", filterMeta] });
      const previousData = queryClient.getQueryData([
        "mileage-logs",
        filterMeta,
      ]);
      queryClient.setQueryData(["mileage-logs", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newMileageLog[0], ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      return { previousData };
    },
    onError: (_err, _newMileageLog, context: any) => {
      queryClient.setQueryData(["mileage-logs", filterMeta], context.previousData);
      toast.error("Failed to add mileage log.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-logs", filterMeta] });
    },
  });

  const deleteMileageLogMutation = useMutation({
    mutationFn: deleteMileageLog,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["mileage-logs", filterMeta] });
      const previousData = queryClient.getQueryData([
        "mileage-logs",
        filterMeta,
      ]);
      queryClient.setQueryData(["mileage-logs", filterMeta], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: { data: MileageLogRow[] }) => ({
            ...page,
            data: page.data.filter((r: MileageLogRow) => !ids.includes(r.id)),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err, _ids, context: any) => {
      queryClient.setQueryData(["mileage-logs", filterMeta], context.previousData);
      toast.error("Failed to delete mileage logs.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mileage-logs", filterMeta] });
    },
  });

  const handleAddNewMileageLog = () => {
    const newMileageLog = [
      {
        id: uuidv4(),
        destination: "",
        countiesMarketed: "",
        beginningMileage: 0,
        endingMileage: 0,
        totalMiles: 0,
        rateType: MileageRateType[0],
        ratePerMile: FEDERAL_RATE,
        reimbursementAmount: 0,
      },
    ];
    addMileageLogMutation.mutate(newMileageLog);
  };

  const handleDeleteMileageLogs = (columnIds: string[]) => {
    deleteMileageLogMutation.mutate(columnIds);
  };

  return (
    <div className="p-8 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mileage Log Master List</h1>

      <MasterListFilters
        columns={data?.pages[0].columns ?? []}
        filterMeta={filterMeta}
        refetch={refetch}
        setFilterMeta={setFilterMeta}
        isMileage={true}
      />

      <ReusableTable
        table={table}
        columns={columns as any}
        isFetchingList={isFetchingNextPage || isFetching}
        onLoadMore={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        hasMore={hasNextPage}
        setActivePage={() => {}}
        onAdd={handleAddNewMileageLog}
        onDelete={handleDeleteMileageLogs}
      />
    </div>
  );
}

