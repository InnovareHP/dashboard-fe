import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ButtonGroup } from "../ui/button-group";

import { RefreshCcw, SearchIcon } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { FilterComponent } from "./filter-component";

export function MasterListFilters({
  columns,
  filterMeta,
  setFilterMeta,
  isReferral = false,
  isMileage = false,
  isMarketing = false,
  refetch,
}: {
  columns: { id: string; name: string; type: string }[];
  filterMeta: any;
  setFilterMeta: (meta: any) => void;
  isReferral?: boolean;
  isMileage?: boolean;
  isMarketing?: boolean;
  refetch: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    setFilterMeta((prev: any) => ({
      ...prev,
      filter: {
        ...prev.filters,
        [key]: value,
      },
    }));
  };

  const handleSearch = () => {
    setFilterMeta((prev: any) => ({
      ...prev,
      search: searchValue,
    }));
  };

  const handleRefresh = () => {
    setFilterMeta((prev: any) => ({
      ...prev,
      filters: {},
    }));
    refetch();
  };

  // ⭐ SPECIAL CASE: MILEAGE MODE
  if (isMileage) {
    return (
      <>
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
          <div className="flex justify-start flex-wrap items-start gap-4">
            <Button onClick={handleRefresh}>
              Refresh <RefreshCcw className="w-4 h-4" />
            </Button>

            {/* ONLY DATE RANGE SHOWN */}
            <DateRangeFilter
              from={filterMeta.filter.mileageDateFrom}
              to={filterMeta.filter.mileageDateTo}
              onChange={(range) =>
                setFilterMeta({
                  ...filterMeta,
                  filter: {
                    ...filterMeta.filter,
                    mileageDateFrom: range.from,
                    mileageDateTo: range.to,
                  },
                })
              }
            />

            <Button
              variant="secondary"
              onClick={() =>
                setFilterMeta({
                  filters: {},
                  filter: {},
                  limit: filterMeta.limit,
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ⭐ SPECIAL CASE: MARKETING MODE
  if (isMarketing) {
    return (
      <>
        <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
          <div className="flex justify-start flex-wrap items-start gap-4">
            <Button onClick={handleRefresh}>
              Refresh <RefreshCcw className="w-4 h-4" />
            </Button>

            {/* ONLY DATE RANGE SHOWN */}
            <DateRangeFilter
              from={filterMeta.filter.marketingDateFrom}
              to={filterMeta.filter.marketingDateTo}
              onChange={(range) =>
                setFilterMeta({
                  ...filterMeta,
                  filter: {
                    ...filterMeta.filter,
                    marketingDateFrom: range.from,
                    marketingDateTo: range.to,
                  },
                })
              }
            />

            <Button
              variant="secondary"
              onClick={() =>
                setFilterMeta({
                  filters: {},
                  filter: {},
                  limit: filterMeta.limit,
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ⭐ NORMAL MODE (lead/referral)
  return (
    <>
      {/* === TOP BAR FILTERS === */}
      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
        <div className="flex justify-start flex-wrap items-start  gap-4">
          {/* SEARCH BAR */}
          <div className="w-auto">
            <ButtonGroup>
              <Input
                placeholder={
                  isReferral ? "Search referrals..." : "Search leads..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant={"outline"} onClick={handleSearch}>
                <SearchIcon />
              </Button>
            </ButtonGroup>
          </div>

          <Button onClick={handleRefresh}>
            Refresh <RefreshCcw className="w-4 h-4" />
          </Button>

          {/* NORMAL DATE RANGE */}
          <DateRangeFilter
            from={
              isReferral ? filterMeta.referralDateFrom : filterMeta.leadDateFrom
            }
            to={isReferral ? filterMeta.referralDateTo : filterMeta.leadDateTo}
            onChange={(range) =>
              setFilterMeta((prev: any) => ({
                ...prev,
                ...(isReferral
                  ? {
                      referralDateFrom: range.from,
                      referralDateTo: range.to,
                    }
                  : {
                      leadDateFrom: range.from,
                      leadDateTo: range.to,
                    }),
              }))
            }
          />

          <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
            More Filters
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              setFilterMeta({
                ...(isReferral
                  ? {
                      referralDateFrom: null,
                      referralDateTo: null,
                    }
                  : {
                      leadDateFrom: null,
                      leadDateTo: null,
                    }),
                filters: {},
                filter: {},
                limit: filterMeta.limit,
              })
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {/* === FILTER SHEET === */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[350px] sm:w-[400px] p-4">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {columns
                .filter((col) => ["TEXT", "EMAIL", "PHONE"].includes(col.type))
                .map((col) => (
                  <div key={col.name} className="space-y-4">
                    <label className="text-sm font-medium">{col.name}</label>
                    <FilterComponent
                      col={col}
                      filterMeta={filterMeta}
                      updateFilter={updateFilter}
                    />
                  </div>
                ))}
            </div>

            <SheetFooter className="mt-6">
              <Button
                className="w-full"
                onClick={() => {
                  setIsSheetOpen(false);
                }}
              >
                Apply Filters
              </Button>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
