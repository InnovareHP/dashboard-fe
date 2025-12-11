import { formatDateTime } from "@/lib/utils";
import { getMarketLogs } from "@/services/market/market-service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MasterListFilters } from "../master-list/master-list-filter";
import { ReusableTable } from "../reusable-table/generic-table";

export default function MarketingReportPage() {
  const [filterMeta, setFilterMeta] = useState({
    marketingDateFrom: null,
    marketingDateTo: null,
    filter: {},
    limit: 20,
  });

  const { data, refetch, isFetchingNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["marketing-report", filterMeta],
    queryFn: () => getMarketLogs(filterMeta),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="p-8 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Marketing Report</h1>

      <MasterListFilters
        columns={data?.pages[0]?.columns ?? []}
        filterMeta={filterMeta}
        refetch={refetch}
        setFilterMeta={setFilterMeta}
        isMarketing={true}
      />

      <div className="border rounded-lg p-4">
        <ReusableTable
          data={rows ?? []}
          columns={[
            {
              key: "date",
              header: "Date",
              render: (row) => formatDateTime(row.createdAt),
            },
            {
              key: "facility",
              header: "Facility",
              render: (row) => row.facility || "N/A",
            },
            {
              key: "touchpoint",
              header: "Touchpoint",
              render: (row) =>
                Array.isArray(row.touchpoint)
                  ? row.touchpoint.join(", ").replace(/_/g, " ")
                  : row.touchpoint || "N/A",
            },
            {
              key: "talkedTo",
              header: "Talked To",
              render: (row) => row.talkedTo || "N/A",
            },
            {
              key: "notes",
              header: "Notes",
              render: (row) => row.notes || "N/A",
            },
          ]}
          isLoading={isFetchingNextPage || isFetching}
          emptyMessage="No marketing logs found"
        />
      </div>
    </div>
  );
}

