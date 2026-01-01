"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

interface FilterConfig {
  columnId: string;
  columnType: string;
  columnTitle: string;
  options?: FilterOption[];
}

interface ActiveFilter {
  columnId: string;
  values: string[];
}

interface BoardFilterProps {
  columns: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
}

// Default options for common column types
const STATUS_OPTIONS: FilterOption[] = [
  { value: "not_started", label: "Not Started", color: "#c4c4c4" },
  { value: "working", label: "Working on it", color: "#fdab3d" },
  { value: "stuck", label: "Stuck", color: "#e2445c" },
  { value: "done", label: "Done", color: "#00c875" },
  { value: "pending", label: "Pending Review", color: "#579bfc" },
];

const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "critical", label: "Critical", color: "#333333" },
  { value: "high", label: "High", color: "#e2445c" },
  { value: "medium", label: "Medium", color: "#fdab3d" },
  { value: "low", label: "Low", color: "#579bfc" },
];

export function BoardFilter({ columns, activeFilters, onFiltersChange }: BoardFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<FilterConfig | null>(null);

  // Get filterable columns (STATUS, PRIORITY, PEOPLE)
  const filterableColumns = columns.filter(
    (col) => col.type === "STATUS" || col.type === "PRIORITY" || col.type === "PEOPLE"
  );

  const getOptionsForColumn = (col: { type: string } | FilterConfig): FilterOption[] => {
    const colType = 'columnType' in col ? col.columnType : col.type;
    switch (colType) {
      case "STATUS":
        return STATUS_OPTIONS;
      case "PRIORITY":
        return PRIORITY_OPTIONS;
      case "PEOPLE":
        // Would be populated from workspace members
        return [];
      default:
        return [];
    }
  };

  const toggleFilterValue = (columnId: string, value: string) => {
    const existingFilter = activeFilters.find((f) => f.columnId === columnId);
    
    if (existingFilter) {
      const hasValue = existingFilter.values.includes(value);
      const newValues = hasValue
        ? existingFilter.values.filter((v) => v !== value)
        : [...existingFilter.values, value];
      
      if (newValues.length === 0) {
        onFiltersChange(activeFilters.filter((f) => f.columnId !== columnId));
      } else {
        onFiltersChange(
          activeFilters.map((f) =>
            f.columnId === columnId ? { ...f, values: newValues } : f
          )
        );
      }
    } else {
      onFiltersChange([...activeFilters, { columnId, values: [value] }]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const getActiveFilterCount = () => {
    return activeFilters.reduce((acc, f) => acc + f.values.length, 0);
  };

  const isValueSelected = (columnId: string, value: string) => {
    const filter = activeFilters.find((f) => f.columnId === columnId);
    return filter?.values.includes(value) || false;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9",
              activeFilters.length > 0 && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filters</h4>
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                  onClick={clearAllFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {selectedColumn ? (
            <div className="p-2">
              <button
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setSelectedColumn(null)}
              >
                <ChevronDown className="h-4 w-4 mr-1 rotate-90" />
                Back to columns
              </button>
              <p className="text-xs text-gray-500 mb-2">{selectedColumn.columnTitle}</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {getOptionsForColumn(selectedColumn).map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800",
                      isValueSelected(selectedColumn.columnId, option.value) &&
                        "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => toggleFilterValue(selectedColumn.columnId, option.value)}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        isValueSelected(selectedColumn.columnId, option.value)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      )}
                    >
                      {isValueSelected(selectedColumn.columnId, option.value) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    {option.color && (
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filterableColumns.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No filterable columns. Add Status or Priority columns to enable filtering.
                </p>
              ) : (
                filterableColumns.map((col) => {
                  const activeCount =
                    activeFilters.find((f) => f.columnId === col.id)?.values.length || 0;
                  return (
                    <button
                      key={col.id}
                      className="w-full flex items-center justify-between px-2 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() =>
                        setSelectedColumn({
                          columnId: col.id,
                          columnType: col.type,
                          columnTitle: col.title,
                        })
                      }
                    >
                      <span>{col.title}</span>
                      <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded">
                            {activeCount}
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Active filter pills */}
      {activeFilters.map((filter) => {
        const column = columns.find((c) => c.id === filter.columnId);
        const options = column ? getOptionsForColumn(column) : [];
        
        return filter.values.map((value) => {
          const option = options.find((o) => o.value === value);
          return (
            <div
              key={`${filter.columnId}-${value}`}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
            >
              {option?.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span>{option?.label || value}</span>
              <button
                className="hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-0.5"
                onClick={() => toggleFilterValue(filter.columnId, value)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        });
      })}
    </div>
  );
}
