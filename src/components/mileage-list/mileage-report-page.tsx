import { formatDateTime } from "@/lib/utils";
import { getMileageLogs } from "@/services/mileage/mileage-service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MasterListFilters } from "../master-list/master-list-filter";
import { ReusableTable } from "../reusable-table/generic-table";

export default function MileageReportPage() {
  const [filterMeta, setFilterMeta] = useState({
    mileageDateFrom: null,
    mileageDateTo: null,
    filter: {},
    limit: 20,
  });

  const { data, refetch, isFetchingNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["mileage-report", filterMeta],
    queryFn: () => getMileageLogs(filterMeta),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const rows = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="p-8 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mileage Report</h1>

      <MasterListFilters
        columns={data?.pages[0].columns ?? []}
        filterMeta={filterMeta}
        refetch={refetch}
        setFilterMeta={setFilterMeta}
        isMileage={true}
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
              key: "destination",
              header: "Destination",
              render: (row) => row.destination,
            },
            {
              key: "countiesMarketed",
              header: "Counties Marketed",
              render: (row) => row.countiesMarketed,
            },
            {
              key: "beginningMileage",
              header: "Beginning Mileage",
              render: (row) => row.beginningMileage,
            },
            {
              key: "endingMileage",
              header: "Ending Mileage",
              render: (row) => row.endingMileage,
            },
            {
              key: "totalMiles",
              header: "Total Miles",
              render: (row) => row.totalMiles,
            },
            {
              key: "rateType",
              header: "Rate Type",
              render: (row) => `${row.rateType}`,
            },
            {
              key: "ratePerMile",
              header: "Rate / Mile",
              render: (row) => `$${row.ratePerMile.toFixed(2)}`,
            },
            {
              key: "reimbursementAmount",
              header: "Reimbursement",
              render: (row) => `$${row.reimbursementAmount.toFixed(2)}`,
            },
          ]}
          isLoading={isFetchingNextPage || isFetching}
          emptyMessage="No mileage logs found"
        />
      </div>
    </div>
  );
}
