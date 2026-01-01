"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Menu, X } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { DraggableGroup } from "@/components/board/draggable-group";
import { BoardFilter } from "@/components/board/board-filter";
import { BoardSkeleton } from "@/components/ui/skeleton";
const KanbanView = dynamic(
  () => import("@/components/board/kanban-view").then((mod) => mod.KanbanView),
  {
    loading: () => <div className="p-6">Loading Kanban…</div>,
    ssr: false,
  }
);
const CalendarView = dynamic(
  () => import("@/components/board/calendar-view").then((mod) => mod.CalendarView),
  {
    loading: () => <div className="p-6">Loading Calendar…</div>,
    ssr: false,
  }
);
const TimelineView = dynamic(
  () => import("@/components/board/timeline-view").then((mod) => mod.TimelineView),
  {
    loading: () => <div className="p-6">Loading Timeline…</div>,
    ssr: false,
  }
);
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
  columnValues?: Array<{ columnId: string; value: any }>;
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

interface ActiveFilter {
  columnId: string;
  values: string[];
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("table");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Touch-friendly sensors for mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Debounce search input to avoid re-rendering on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  // Filter and search board data
  const filteredBoard = useMemo(() => {
    if (!board) return null;

    const filtered = {
      ...board,
      groups: board.groups.map(group => ({
        ...group,
        items: group.items.filter(item => {
          // Search filter
          if (debouncedSearch && !item.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
            return false;
          }
          // Active filters (status, priority, etc.)
          for (const filter of activeFilters) {
            const columnValue = item.columnValues?.find(cv => cv.columnId === filter.columnId);
            if (!columnValue) continue;
            
            const valueStr = typeof columnValue.value === 'object' 
              ? columnValue.value?.status || columnValue.value?.priority 
              : String(columnValue.value);
              
            if (valueStr && !filter.values.includes(valueStr)) {
              return false;
            }
          }
          return true;
        })
      })).filter(group => group.items.length > 0 || !debouncedSearch && activeFilters.length === 0)
    };

    return filtered;
  }, [board, debouncedSearch, activeFilters]);

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

  const addColumn = async () => {
    if (!board || !newColumnName.trim()) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/columns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newColumnName,
            type: "TEXT",
          }),
        }
      );

      if (response.ok) {
        setNewColumnName("");
        setIsAddingColumn(false);
        await fetchBoard();
      }
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const addGroup = async () => {
    if (!board || !newGroupName.trim()) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/groups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newGroupName,
          }),
        }
      );

      if (response.ok) {
        setNewGroupName("");
        setIsAddingGroup(false);
        await fetchBoard();
      }
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  if (isLoading) {
    return <BoardSkeleton />;
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
      {/* Board Header - Desktop */}
      <div className="hidden md:block border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {board.name}
            </h1>
            {board.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm truncate">
                {board.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 lg:w-64"
              />
            </div>
            <BoardFilter
              columns={board.columns}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
            <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            <Button variant="outline" size="sm" onClick={() => setIsAddingColumn(true)}>
              <Plus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Add Column</span>
            </Button>
            <Button size="sm" onClick={() => setIsAddingGroup(true)}>
              <Plus className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Add Group</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Board Header - Mobile */}
      <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {board.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
            </div>
            <BoardFilter
              columns={board.columns}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsAddingColumn(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setIsAddingGroup(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
          </div>
        )}
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
                {filteredBoard && filteredBoard.groups.length > 0 ? (
                  <SortableContext
                    items={filteredBoard.groups.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredBoard.groups.map((group) => (
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
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No items match your search.</p>
                  </div>
                )}
              </div>
            </DndContext>
          </div>
        ) : currentView === "kanban" ? (
          <KanbanView
            boardId={boardId}
            workspaceId={workspaceId}
            items={filteredBoard?.groups.flatMap((g) => g.items) || []}
            columns={board.columns}
            onUpdateItem={updateItemStatus}
            onCreateItem={createKanbanItem}
            onItemClick={setSelectedItemId}
          />
        ) : currentView === "calendar" ? (
          <CalendarView
            boardId={boardId}
            workspaceId={workspaceId}
            items={filteredBoard?.groups.flatMap((g) => g.items) || []}
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

      {/* Add Column Dialog */}
      <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Column name..."
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addColumn()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
              Cancel
            </Button>
            <Button onClick={addColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroup()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
              Cancel
            </Button>
            <Button onClick={addGroup}>Add Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
