"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import { DraggableItem } from "./draggable-item";
import { useState } from "react";

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

interface Group {
  id: string;
  title: string;
  color?: string;
  isCollapsed: boolean;
  items: Item[];
}

interface DraggableGroupProps {
  group: Group;
  columns: Column[];
  boardId: string;
  workspaceId: string;
  onToggle: (groupId: string) => void;
  onAddItem: (groupId: string, name: string) => void;
  onItemClick?: (itemId: string) => void;
}

export function DraggableGroup({
  group,
  columns,
  boardId,
  workspaceId,
  onToggle,
  onAddItem,
  onItemClick,
}: DraggableGroupProps) {
  const [newItemName, setNewItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(group.id, newItemName);
      setNewItemName("");
      setIsAddingItem(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        {/* Group Header */}
        <div
          className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          style={{ borderLeft: `4px solid ${group.color || "#6B7280"}` }}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Collapse Button */}
          <button className="mr-2" onClick={() => onToggle(group.id)}>
            {group.isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <h3 className="font-semibold text-lg flex-1">{group.title}</h3>
          <span className="text-sm text-gray-500 mr-4">
            {group.items.length} items
          </span>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Group Content */}
        {!group.isCollapsed && (
          <div>
            {/* Column Headers */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2">
              <div className="w-12"></div> {/* Space for drag handle */}
              <div className="w-64 font-medium text-sm text-gray-700 dark:text-gray-300">
                Item
              </div>
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="font-medium text-sm text-gray-700 dark:text-gray-300"
                  style={{ width: column.width || 150 }}
                >
                  {column.title}
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <SortableContext
                items={group.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {group.items.map((item) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    columns={columns}
                    boardId={boardId}
                    workspaceId={workspaceId}
                    onItemClick={onItemClick}
                  />
                ))}
              </SortableContext>

              {/* Add Item Row */}
              <div className="px-4 py-3">
                {isAddingItem ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter item name..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddItem();
                        if (e.key === "Escape") setIsAddingItem(false);
                      }}
                      autoFocus
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddItem}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingItem(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingItem(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
