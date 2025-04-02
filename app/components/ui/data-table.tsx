"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

interface DataTableProps<TData> {
  columns: Column<TData>[];
  data: TData[];
  onRowSelectionChange?: (selectedRows: string[]) => void;
  getRowClassName?: (row: { original: TData }) => string;
}

export function DataTable<TData>({
  columns,
  data,
  onRowSelectionChange,
  getRowClassName,
}: DataTableProps<TData>) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 5; // Changed to 5 items per page for better visibility
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const renderCellContent = (row: TData, column: Column<TData>): React.ReactNode => {
    if (column.cell) {
      return column.cell({ row: { original: row } });
    }
    const value = row[column.accessorKey];
    return String(value);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={getRowClassName ? getRowClassName({ original: row }) : ""}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(0)}
            disabled={currentPage === 0}
            className="cursor-pointer"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(index)}
                className={`w-8 ${currentPage === index ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="cursor-pointer"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{endIndex} of {data.length} birthdays
        </div>
      </div>
    </div>
  );
} 