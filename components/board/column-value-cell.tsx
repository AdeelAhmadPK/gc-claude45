"use client";

import { memo, useEffect, useState } from "react";
import { ColumnCell } from "./column-cell";

interface ColumnValueCellProps {
  itemId: string;
  columnId: string;
  columnType: string;
  workspaceId: string;
  boardId: string;
}

function ColumnValueCellComponent({ itemId, columnId, columnType, workspaceId, boardId }: ColumnValueCellProps) {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-8 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />;
  }

  return (
    <div className="relative">
      {saving && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/30 rounded animate-pulse pointer-events-none" />
      )}
      <ColumnCell
        type={columnType}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

// Memoized to avoid needless re-renders when parent lists update
export const ColumnValueCell = memo(ColumnValueCellComponent);
