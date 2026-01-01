"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { DraggableGroup } from "@/components/board/draggable-group";
import { KanbanView } from "@/components/board/kanban-view";
import { CalendarView } from "@/components/board/calendar-view";
import { TimelineView } from "@/components/board/timeline-view";
import { ItemDetailPanel } from "@/components/item/item-detail-panel";
import { ViewSwitcher, ViewType } from "@/components/board/view-switcher";

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
  position?: number;
  color?: string;
  isCollapsed: boolean;
  items: Item[];
}

interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  groups: Group[];
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("table");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/workspaces/${params.workspaceId}/boards/${boardId}`);
      if (response.ok) {
        const data = await response.json();
        setBoard({
          ...data,
          groups: data.groups.map((g: any) => ({
            ...g,
            isCollapsed: false,
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    if (!board) return;
    setBoard({
      ...board,
      groups: board.groups.map((g) =>
        g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g
      ),
    });
  };

  const addItem = async (groupId: string, name: string) => {
    if (!board || !name.trim()) return;
    
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            groupId,
          }),
        }
      );

      if (response.ok) {
        const newItem = await response.json();
        setBoard({
          ...board,
          groups: board.groups.map((g) =>
            g.id === groupId
              ? { ...g, items: [...g.items, newItem] }
              : g
          ),
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !board) return;

    const activeItem = board.groups
      .flatMap((g) => g.items)
      .find((item) => item.id === active.id);
    const overItem = board.groups
      .flatMap((g) => g.items)
      .find((item) => item.id === over.id);

    if (activeItem && overItem) {
      // Reordering items
      const activeGroupId = board.groups.find((g) =>
        g.items.some((item) => item.id === active.id)
      )?.id;
      const overGroupId = board.groups.find((g) =>
        g.items.some((item) => item.id === over.id)
      )?.id;

      if (!activeGroupId || !overGroupId) return;

      setBoard((prev) => {
        if (!prev) return prev;

        if (activeGroupId === overGroupId) {
          // Same group reordering
          const group = prev.groups.find((g) => g.id === activeGroupId);
          if (!group) return prev;

          const oldIndex = group.items.findIndex((item) => item.id === active.id);
          const newIndex = group.items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(group.items, oldIndex, newIndex).map(
            (item, idx) => ({ ...item, position: idx })
          );

          return {
            ...prev,
            groups: prev.groups.map((g) =>
              g.id === activeGroupId ? { ...g, items: newItems } : g
            ),
          };
        } else {
          // Moving between groups
          const sourceGroup = prev.groups.find((g) => g.id === activeGroupId);
          const destGroup = prev.groups.find((g) => g.id === overGroupId);

          if (!sourceGroup || !destGroup) return prev;

          const sourceItems = sourceGroup.items.filter((item) => item.id !== active.id);
          const destIndex = destGroup.items.findIndex((item) => item.id === over.id);
          const movedItem = sourceGroup.items.find((item) => item.id === active.id);

          if (!movedItem) return prev;

          const destItems = [
            ...destGroup.items.slice(0, destIndex + 1),
            movedItem,
            ...destGroup.items.slice(destIndex + 1),
          ].map((item, idx) => ({ ...item, position: idx }));

          return {
            ...prev,
            groups: prev.groups.map((g) => {
              if (g.id === activeGroupId) return { ...g, items: sourceItems };
              if (g.id === overGroupId) return { ...g, items: destItems };
              return g;
            }),
          };
        }
      });

      // Persist to backend
      const updatedItems = board.groups.flatMap((g) =>
        g.items.map((item, idx) => ({
          id: item.id,
          position: idx,
          groupId: g.id,
        }))
      );

      await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "items", items: updatedItems }),
      });
    } else {
      // Reordering groups
      const activeGroup = board.groups.find((g) => g.id === active.id);
      const overGroup = board.groups.find((g) => g.id === over.id);

      if (activeGroup && overGroup) {
        const oldIndex = board.groups.findIndex((g) => g.id === active.id);
        const newIndex = board.groups.findIndex((g) => g.id === over.id);

        const newGroups = arrayMove(board.groups, oldIndex, newIndex);

        setBoard({
          ...board,
          groups: newGroups,
        });

        // Persist to backend
        const updatedGroups = newGroups.map((g, idx) => ({
          id: g.id,
          position: idx,
        }));

        await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "groups", groups: updatedGroups }),
        });
      }
    }
  };

  const updateItemStatus = async (itemId: string, updates: any) => {
    try {
      // Find status column
      const statusColumn = board?.columns.find(c => c.type === "STATUS");
      if (!statusColumn) return;

      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/values`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            columnId: statusColumn.id,
            value: updates,
          }),
        }
      );

      if (response.ok) {
        await fetchBoard();
      }
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const createKanbanItem = async (name: string, statusValue: any) => {
    if (!board || !name.trim()) return;

    const firstGroup = board.groups[0];
    if (!firstGroup) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            groupId: firstGroup.id,
          }),
        }
      );

      if (response.ok) {
        await fetchBoard();
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <p className="text-gray-600">The board you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {board.name}
            </h1>
            {board.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-auto">
        {currentView === "table" ? (
          <div className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-6">
                <SortableContext
                  items={board.groups.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {board.groups.map((group) => (
                    <DraggableGroup
                      key={group.id}
                      group={group}
                      columns={board.columns}
                      boardId={boardId}
                      workspaceId={workspaceId}
                      onToggle={toggleGroup}
                      onAddItem={addItem}
                      onItemClick={setSelectedItemId}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        ) : currentView === "kanban" ? (
          <KanbanView
            boardId={boardId}
            workspaceId={workspaceId}
            items={board.groups.flatMap((g) => g.items)}
            columns={board.columns}
            onUpdateItem={updateItemStatus}
            onCreateItem={createKanbanItem}
            onItemClick={setSelectedItemId}
          />
        ) : currentView === "calendar" ? (
          <CalendarView
            boardId={boardId}
            workspaceId={workspaceId}
            items={board.groups.flatMap((g) => g.items)}
            columns={board.columns}
            onItemClick={setSelectedItemId}
          />
        ) : currentView === "timeline" ? (
          <TimelineView
            groups={board.groups.map(g => ({
              id: g.id,
              name: g.title,
              position: g.position || 0,
              items: g.items.map(item => ({
                ...item,
                columnValues: [] // Will be fetched by TimelineView if needed
              }))
            }))}
            onItemClick={setSelectedItemId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {String(currentView).charAt(0).toUpperCase() + String(currentView).slice(1)} View
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Panel */}
      <ItemDetailPanel
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        itemId={selectedItemId || ""}
        boardId={boardId}
        workspaceId={workspaceId}
      />
    </div>
  );
}
