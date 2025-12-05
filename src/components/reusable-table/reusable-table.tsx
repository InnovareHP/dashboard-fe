import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ColumnDef,
  flexRender,
  type Table as ReactTable,
} from "@tanstack/react-table";
import { MoreHorizontalIcon, Plus, Trash2Icon } from "lucide-react";
import Loader from "../loader";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
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
  columns: ColumnDef<{ id: string; name: string; type: string }>[];
  isFetchingList: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  setActivePage: () => void;
  onAdd: () => void;
  onDelete: (ids: string[]) => void;
  isReferral?: boolean;
};

const ReusableTable = <T extends { id: string }>({
  table,
  columns,
  isFetchingList,
  onLoadMore,
  hasMore = false,
  onAdd,
  onDelete,
  isReferral = false,
}: Props<T>) => {
  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelected = selectedRows.length > 0;
  const selectedIds = selectedRows.map((r) => r.original.id);

  return (
    <Card>
      <CardContent className="relative">
        <ScrollArea className="relative w-full ">
          <Loader isLoading={isFetchingList} />

          {hasSelected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More Options">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(selectedIds)}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Table className="border border-gray-300">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-300"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="text-primary text-center font-bold border border-gray-300"
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    className={
                      "table-text border-b border-gray-300 " +
                      (index % 2 === 0 ? "table-row-header" : "")
                    }
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border border-gray-300 px-10"
                      >
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
                  <TableCell
                    colSpan={columns.length}
                    className="text-center border border-gray-300"
                  >
                    No data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {hasMore && (
          <div className="flex items-center justify-between mt-4">
            <Button onClick={onLoadMore} variant="ghost" className="flex gap-2">
              Load More
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Button onClick={onAdd} variant="ghost" className="flex gap-2">
              <Plus className="w-4 h-4" />{" "}
              {isReferral ? "Add New Referral" : "Add New Lead"}
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            {table.getRowModel().rows.length} total entries
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReusableTable;
