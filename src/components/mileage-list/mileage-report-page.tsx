import { formatDateTime } from "@/lib/utils";
import { getMileageLogs } from "@/services/mileage/mileage-service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { DollarSign, MapPin, Route } from "lucide-react";
import { useMemo, useState } from "react";
import { MasterListFilters } from "../master-list/master-list-filter";
import { ReusableTable } from "../reusable-table/generic-table";
import { Card, CardContent } from "../ui/card";

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

  // Calculate totals
  const totals = useMemo(() => {
    const totalReimbursement = rows.reduce(
      (sum, row) => sum + (row.reimbursementAmount || 0),
      0
    );
    const totalMiles = rows.reduce(
      (sum, row) => sum + (row.totalMiles || 0),
      0
    );
    const totalTrips = rows.length;

    return {
      totalReimbursement,
      totalMiles,
      totalTrips,
    };
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Header */}
      <div className="p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Mileage Report</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track and manage mileage reimbursements
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Reimbursement */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-emerald-50">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Reimbursement
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ${totals.totalReimbursement.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Miles */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Route className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Miles
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totals.totalMiles.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total Trips */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Trips
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totals.totalTrips}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <MasterListFilters
          columns={data?.pages[0].columns ?? []}
          filterMeta={filterMeta}
          refetch={refetch}
          setFilterMeta={setFilterMeta}
          isMileage={true}
        />

        {/* Table */}
        <Card className="border-2">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
