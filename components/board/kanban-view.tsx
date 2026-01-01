"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Plus, MoreHorizontal, Clock, AlertCircle, Users, Paperclip, MessageSquare } from "lucide-react";
import { DndContext, DragEndEvent, DragOverEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Column {
  id: string;
  title: string;
  type: string;
  settings?: any;
}

interface Item {
  id: string;
  name: string;
  description?: string | null;
  position: number;
  priority?: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  dueDate?: string | null;
  estimatedHours?: number | null;
  columnValues?: any[];
  assignments?: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  comments?: any[];
  files?: any[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: Item[];
  wipLimit?: number;
}

interface KanbanViewProps {
  boardId: string;
  workspaceId: string;
  items: Item[];
  columns: Column[];
  onUpdateItem: (itemId: string, updates: any) => void;
  onCreateItem: (name: string, statusValue: string) => void;
  onItemClick?: (itemId: string) => void;
}

function KanbanCard({ item, onClick }: { item: Item; onClick?: () => void }) {
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

  // Priority color mapping
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "border-l-4 border-l-red-500";
      case "HIGH":
        return "border-l-4 border-l-orange-500";
      case "MEDIUM":
        return "border-l-4 border-l-yellow-500";
      case "LOW":
        return "border-l-4 border-l-green-500";
      default:
        return "";
    }
  };

  // Check if due date is approaching or overdue
  const getDueDateStatus = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Overdue", color: "text-red-600 dark:text-red-400", icon: true };
    if (diffDays <= 2) return { label: format(due, "MMM d"), color: "text-orange-600 dark:text-orange-400", icon: true };
    return { label: format(due, "MMM d"), color: "text-gray-600 dark:text-gray-400", icon: false };
  };

  const dueDateStatus = getDueDateStatus(item.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-card p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        "cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600",
        "transition-all duration-200",
        getPriorityColor(item.priority),
        isDragging && "shadow-2xl ring-2 ring-primary/50"
      )}
    >
      {/* Drag handle area */}
      <div {...listeners} className="cursor-grab active:cursor-grabbing mb-2">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
        
        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Priority Badge */}
      {item.priority && item.priority !== "NONE" && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs mb-2",
            item.priority === "URGENT" && "border-red-500 text-red-600 dark:text-red-400 bg-red-500/10",
            item.priority === "HIGH" && "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-500/10",
            item.priority === "MEDIUM" && "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
            item.priority === "LOW" && "border-green-500 text-green-600 dark:text-green-400 bg-green-500/10"
          )}
        >
          {item.priority}
        </Badge>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Assignees */}
          {item.assignments && item.assignments.length > 0 && (
            <AvatarGroup
              users={item.assignments.map((a) => a.user)}
              max={3}
              size="xs"
            />
          )}

          {/* Due Date */}
          {dueDateStatus && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", dueDateStatus.color)}>
              {dueDateStatus.icon && <Clock className="w-3.5 h-3.5" />}
              <span>{dueDateStatus.label}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          {/* Comments count */}
          {item.comments && item.comments.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{item.comments.length}</span>
            </div>
          )}

          {/* Files count */}
          {item.files && item.files.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{item.files.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanView({
  boardId,
  workspaceId,
  items,
  columns,
  onUpdateItem,
  onCreateItem,
  onItemClick,
}: KanbanViewProps) {
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [showWipLimits, setShowWipLimits] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // Find the status column
    const statusColumn = columns.find((col) => col.type === "STATUS");
    if (!statusColumn || !statusColumn.settings?.labels) return;

    // Create Kanban columns from status labels
    const labels = statusColumn.settings.labels as Array<{ id: string; label: string; color: string }>;
    
    const newKanbanColumns: KanbanColumn[] = labels.map((label) => {
      // Filter items that have this status value
      const columnItems = items.filter((item) => {
        const statusValue = item.columnValues?.find(
          (cv: any) => cv.columnId === statusColumn.id
        );
        return statusValue?.value?.id === label.id;
      });

      return {
        id: label.id,
        title: label.label,
        color: label.color,
        items: columnItems,
        wipLimit: undefined, // Can be configured per column
      };
    });

    // Add "No Status" column for items without status
    const noStatusItems = items.filter((item) => {
      const statusValue = item.columnValues?.find(
        (cv: any) => cv.columnId === statusColumn.id
      );
      return !statusValue || !statusValue.value;
    });

    newKanbanColumns.push({
      id: "no-status",
      title: "No Status",
      color: "#94A3B8",
      items: noStatusItems,
      wipLimit: undefined,
    });

    setKanbanColumns(newKanbanColumns);
  }, [items, columns]);

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Implement visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Find which column the item was dropped into
    const overColumnId = over.id as string;
    const activeItemId = active.id as string;

    // Find the status column
    const statusColumn = columns.find((col) => col.type === "STATUS");
    if (!statusColumn) return;

    // Update item status
    const newStatusValue = overColumnId === "no-status" 
      ? null 
      : { id: overColumnId };

    onUpdateItem(activeItemId, {
      columnId: statusColumn.id,
      value: newStatusValue,
    });
  };

  const handleAddItem = (columnId: string) => {
    if (!newItemName || !newItemName.trim()) return;
    
    const statusValue = columnId === "no-status" ? null : columnId;
    onCreateItem(newItemName, statusValue || "");
    setNewItemName("");
    setActiveColumnId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto p-6">
        {kanbanColumns.map((column) => {
          const isOverWipLimit = column.wipLimit && column.items.length > column.wipLimit;
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 flex flex-col"
            >
              {/* Column Header */}
              <div className="mb-4">
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl shadow-sm border",
                    "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50",
                    "border-gray-200 dark:border-gray-700",
                    isOverWipLimit && "ring-2 ring-red-500 ring-offset-2"
                  )}
                  style={{ 
                    borderLeftColor: column.color,
                    borderLeftWidth: '4px'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium px-2 py-1 rounded-md",
                      isOverWipLimit 
                        ? "text-red-600 dark:text-red-400 bg-red-500/10 font-bold" 
                        : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700"
                    )}>
                      {column.items.length}
                      {column.wipLimit && ` / ${column.wipLimit}`}
                    </span>
                    {isOverWipLimit && (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <Card className="flex-1 p-3 overflow-y-auto">
                <SortableContext
                  items={column.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {column.items.map((item) => (
                      <KanbanCard 
                        key={item.id} 
                        item={item}
                        onClick={() => onItemClick?.(item.id)}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* Add Item */}
                <div className="mt-3">
                  {activeColumnId === column.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter item name..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddItem(column.id);
                          if (e.key === "Escape") setActiveColumnId(null);
                        }}
                        autoFocus
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(column.id)}
                          className="flex-1"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveColumnId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveColumnId(column.id)}
                      className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
