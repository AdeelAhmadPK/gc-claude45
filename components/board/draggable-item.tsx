"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ColumnValueCell } from "./column-value-cell";

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
      className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer"
      onClick={() => onItemClick?.(item.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mr-3 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Item Name */}
      <div className="w-64 font-medium">{item.name}</div>

      {/* Column Values */}
      {columns.map((column) => (
        <div
          key={column.id}
          className="text-sm"
          style={{ width: column.width || 150 }}
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
  );
}
