import {
  type ColumnDef,
  flexRender,
  type Table as ReactTable,
} from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props<T> = {
  table: ReactTable<T>;
  columns: ColumnDef<T>[];
  //   activePage: number;
  //   totalCount: number;
  isFetchingList: boolean;
  setActivePage: Dispatch<SetStateAction<number>>;
  skip?: number;
};

const ReusableTable = <T extends object>({
  table,
  columns,
  //   activePage,
  //   totalCount,
  isFetchingList,
  //   skip = 10,
}: Props<T>) => {
  //   const skipValue = typeof skip === "number" ? skip : 10;
  //   const pageCount = Math.ceil(totalCount / skipValue);

  return (
    <Card>
      <CardContent>
        <ScrollArea className="relative w-full overflow-x-auto">
          {isFetchingList && (
            <Skeleton className="h-[500px] w-full rounded-md absolute top-0 left-0" />
          )}

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="text-primary font-bold"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getExpandedRowModel().rows.length ? (
                table.getExpandedRowModel().rows.map((row, index) => (
                  <TableRow
                    className={
                      "table-text " +
                      (index % 2 === 0 ? "table-row-header" : "")
                    }
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            {/* <tfoot>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div>
                    <span className="text-sm text-primary font-medium">
                      Results {Math.min(activePage * 10, totalCount)} /{" "}
                      {totalCount}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </tfoot> */}
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* <div className="flex items-center justify-center gap-x-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={activePage === 1}
            onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {(() => {
              const maxVisiblePages = 2;
              const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
              let displayedPages = [];

              if (pageCount <= maxVisiblePages) {
                displayedPages = pages;
              } else {
                if (activePage <= 2) {
                  displayedPages = [1, 2, 3, "...", pageCount];
                } else if (activePage >= pageCount - 1) {
                  displayedPages = [
                    1,
                    "...",
                    pageCount - 2,
                    pageCount - 1,
                    pageCount,
                  ];
                } else {
                  displayedPages = [
                    activePage - 1,
                    activePage,
                    activePage + 1,
                    "...",
                    pageCount,
                  ];
                }
              }

              return displayedPages.map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={page}
                    onClick={() => setActivePage(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={`ellipsis-${index}`}>{page}</span>
                )
              );
            })()}
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={activePage === pageCount}
            onClick={() =>
              setActivePage((prev) => Math.min(prev + 1, pageCount))
            }
          >
            Next
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default ReusableTable;
