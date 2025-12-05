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
  refetch,
}: {
  columns: { id: string; name: string; type: string }[];
  filterMeta: any;
  setFilterMeta: (meta: any) => void;
  refetch: () => void;
  isReferral?: boolean;
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
      filters: {
        ...prev.filters,
      },
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

  return (
    <>
      {/* === TOP BAR FILTERS === */}
      <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm space-y-4">
        <div className="flex justify-start items-start  gap-4">
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
              <Button
                variant={"outline"}
                onClick={handleSearch}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              >
                <SearchIcon />{" "}
              </Button>
            </ButtonGroup>
          </div>

          <Button onClick={handleRefresh}>
            Refresh <RefreshCcw className="w-4 h-4" />
          </Button>

          <DateRangeFilter
            from={filterMeta.leadDateFrom}
            to={filterMeta.leadDateTo}
            onChange={(range) =>
              setFilterMeta((prev: any) => ({
                ...prev,
                leadDateFrom: range.from,
                leadDateTo: range.to,
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
                leadDateFrom: null,
                leadDateTo: null,
                filters: {},
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
                .filter(
                  (col) =>
                    col.type === "TEXT" ||
                    col.type === "EMAIL" ||
                    col.type === "PHONE"
                )
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
                  setFilterMeta((prev: any) => ({
                    ...prev,
                    filter: {
                      ...prev.filter,
                      ...filterMeta.filter,
                    },
                  }));
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
