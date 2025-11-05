"use client";

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
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
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
  isFetchingList: boolean;
  setActivePage: Dispatch<SetStateAction<number>>;
  onAddNewLead: () => void;
  onDeleteLeads?: (ids: string[]) => void; // ✅ new prop for deletion
  isReferral?: boolean;
};

const ReusableTable = <T extends { id: string }>({
  table,
  columns,
  isFetchingList,
  onAddNewLead,
  onDeleteLeads,
  isReferral = false,
}: Props<T>) => {
  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelected = selectedRows.length > 0;
  const selectedIds = selectedRows.map((r) => r.original.id);

  return (
    <Card>
      <CardContent>
        <ScrollArea className="relative w-full ">
          {isFetchingList && (
            <Skeleton className="h-[500px] w-full rounded-md absolute top-0 left-0" />
          )}

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
                    onClick={() => onDeleteLeads?.(selectedIds)}
                  >
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
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
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onAddNewLead}
              variant="ghost"
              className="flex gap-2"
            >
              <Plus className="w-4 h-4" />{" "}
              {isReferral ? "Add New Referral" : "Add New Lead"}
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            {table.getRowModel().rows.length} total lead(s)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReusableTable;
