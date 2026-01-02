"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface Column {
  id: string;
  title: string;
  type: string;
  width?: number;
  visible?: boolean;
}

interface ColumnCustomizationProps {
  columns: Column[];
  onReorderColumns: (newOrder: Column[]) => void;
  onToggleColumn: (columnId: string, visible: boolean) => void;
  onResizeColumn: (columnId: string, width: number) => void;
}

function SortableColumnItem({ column, onToggle }: { column: Column; onToggle: (visible: boolean) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isVisible = column.visible !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
        isDragging && "shadow-lg ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {column.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{column.type}</p>
        </div>
      </div>

      <button
        onClick={() => onToggle(!isVisible)}
        className="ml-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        {isVisible ? (
          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}

export function ColumnCustomization({
  columns,
  onReorderColumns,
  onToggleColumn,
  onResizeColumn,
}: ColumnCustomizationProps) {
  const [open, setOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState(columns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localColumns.findIndex((col) => col.id === active.id);
    const newIndex = localColumns.findIndex((col) => col.id === over.id);

    const reordered = arrayMove(localColumns, oldIndex, newIndex);
    setLocalColumns(reordered);
  };

  const handleSave = () => {
    onReorderColumns(localColumns);
    setOpen(false);
  };

  const handleToggle = (columnId: string, visible: boolean) => {
    const updated = localColumns.map((col) =>
      col.id === columnId ? { ...col, visible } : col
    );
    setLocalColumns(updated);
    onToggleColumn(columnId, visible);
  };

  const visibleCount = localColumns.filter((col) => col.visible !== false).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Customize Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Drag to reorder • Toggle to show/hide • {visibleCount} of {localColumns.length} visible
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns.map((col) => col.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {localColumns.map((column) => (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    onToggle={(visible) => handleToggle(column.id, visible)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
