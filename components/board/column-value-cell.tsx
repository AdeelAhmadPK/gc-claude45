"use client";

import { useState, useEffect } from "react";
import { ColumnCell } from "./column-cell";

interface ColumnValueCellProps {
  itemId: string;
  columnId: string;
  columnType: string;
  workspaceId: string;
  boardId: string;
}

export function ColumnValueCell({ itemId, columnId, columnType, workspaceId, boardId }: ColumnValueCellProps) {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumnValue();
  }, [itemId, columnId]);

  const fetchColumnValue = async () => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`
      );
      if (response.ok) {
        const item = await response.json();
        const columnValue = item.columnValues?.find((cv: any) => cv.columnId === columnId);
        setValue(columnValue?.value || null);
      }
    } catch (error) {
      console.error("Failed to fetch column value:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (newValue: any) => {
    setValue(newValue);
    
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId,
            value: newValue,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to update column value:", error);
      // Revert on error
      await fetchColumnValue();
    }
  };

  if (loading) {
    return <div className="h-8 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />;
  }

  return (
    <ColumnCell
      type={columnType}
      value={value}
      onChange={handleChange}
    />
  );
}
