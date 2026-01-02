"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ColumnValueCell } from "./column-value-cell";

interface Subitem {
  id: string;
  name: string;
  position: number;
  columnValues?: Array<{ columnId: string; value: any }>;
}

interface SubitemsProps {
  itemId: string;
  boardId: string;
  workspaceId: string;
  columns: Array<{
    id: string;
    title: string;
    type: string;
    width?: number;
  }>;
  onSubitemClick?: (subitemId: string) => void;
}

export function Subitems({ itemId, boardId, workspaceId, columns, onSubitemClick }: SubitemsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subitems, setSubitems] = useState<Subitem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubitemName, setNewSubitemName] = useState("");

  const fetchSubitems = async () => {
    if (subitems.length > 0) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/subitems`
      );
      if (response.ok) {
        const data = await response.json();
        setSubitems(data);
        setIsExpanded(true);
      }
    } catch (error) {
      console.error("Failed to fetch subitems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubitem = async () => {
    if (!newSubitemName.trim()) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/subitems`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newSubitemName }),
        }
      );

      if (response.ok) {
        const newSubitem = await response.json();
        setSubitems([...subitems, newSubitem]);
        setNewSubitemName("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add subitem:", error);
    }
  };

  const deleteSubitem = async (subitemId: string) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${subitemId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setSubitems(subitems.filter((s) => s.id !== subitemId));
      }
    } catch (error) {
      console.error("Failed to delete subitem:", error);
    }
  };

  return (
    <div className="ml-8">
      {/* Subitems toggle button */}
      <button
        onClick={fetchSubitems}
        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="font-medium">
          Subitems {subitems.length > 0 && `(${subitems.length})`}
        </span>
      </button>

      {/* Subitems list */}
      {isExpanded && (
        <div className="mt-2 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-4">
          {subitems.map((subitem, index) => (
            <div
              key={subitem.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/30 group cursor-pointer",
                "border-b border-gray-100 dark:border-gray-800"
              )}
              onClick={() => onSubitemClick?.(subitem.id)}
            >
              {/* Subitem name */}
              <div className="w-48 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {subitem.name}
              </div>

              {/* Column values - show first 2 columns on mobile, all on desktop */}
              <div className="hidden md:flex items-center gap-2 flex-1">
                {columns.slice(0, 3).map((column) => (
                  <div
                    key={column.id}
                    className="text-sm"
                    style={{ width: column.width || 150 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ColumnValueCell
                      itemId={subitem.id}
                      columnId={column.id}
                      columnType={column.type}
                      workspaceId={workspaceId}
                      boardId={boardId}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile - show only first column */}
              <div className="md:hidden flex-1">
                {columns[0] && (
                  <div className="text-xs" onClick={(e) => e.stopPropagation()}>
                    <ColumnValueCell
                      itemId={subitem.id}
                      columnId={columns[0].id}
                      columnType={columns[0].type}
                      workspaceId={workspaceId}
                      boardId={boardId}
                    />
                  </div>
                )}
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSubitem(subitem.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
              >
                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          ))}

          {/* Add subitem form */}
          {isAdding ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Input
                value={newSubitemName}
                onChange={(e) => setNewSubitemName(e.target.value)}
                placeholder="Subitem name..."
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubitem();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewSubitemName("");
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={addSubitem} className="h-8">
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewSubitemName("");
                }}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors w-full"
            >
              <Plus className="h-4 w-4" />
              <span>Add subitem</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
