"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight } from "lucide-react";
import { ColumnValueCell } from "./column-value-cell";
import { memo } from "react";

interface Column {
  id: string;
  title: string;
  type: string;
  width?: number;
}

interface Item {
  id: string;
  name: string;
  position: number;
}

interface DraggableItemProps {
  item: Item;
  columns: Column[];
  boardId: string;
  workspaceId: string;
  onItemClick?: (itemId: string) => void;
}

export function DraggableItem({ item, columns, boardId, workspaceId, onItemClick }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center px-2 md:px-4 py-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 group cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors"
      onClick={() => onItemClick?.(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onItemClick?.(item.id);
        }
      }}
    >
      {/* Drag Handle - larger touch target on mobile */}
      <div
        {...attributes}
        {...listeners}
        className="mr-2 md:mr-3 cursor-grab active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 -ml-1 touch-manipulation"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5 md:h-4 md:w-4 text-gray-400" />
      </div>

      {/* Item Name - Desktop */}
      <div className="hidden md:block w-64 font-medium text-gray-900 dark:text-gray-100 truncate">
        {item.name}
      </div>

      {/* Mobile Layout - stacked card style */}
      <div className="md:hidden flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        {/* Show first 2 columns preview on mobile */}
        <div className="flex items-center gap-2 mt-1">
          {columns.slice(0, 2).map((column) => (
            <div
              key={column.id}
              className="text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <ColumnValueCell
                itemId={item.id}
                columnId={column.id}
                columnType={column.type}
                workspaceId={workspaceId}
                boardId={boardId}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Column Values - Desktop */}
      <div className="hidden md:contents">
        {columns.map((column) => (
          <div
            key={column.id}
            className="text-sm"
            style={{ width: column.width || 150 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ColumnValueCell
              itemId={item.id}
              columnId={column.id}
              columnType={column.type}
              workspaceId={workspaceId}
              boardId={boardId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(DraggableItem);
