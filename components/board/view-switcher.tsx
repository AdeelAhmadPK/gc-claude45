"use client";

import { useState } from "react";
import { LayoutGrid, Columns3, Calendar, GanttChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewType = "table" | "kanban" | "calendar" | "timeline";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: "table" as ViewType, label: "Table", icon: LayoutGrid },
    { id: "kanban" as ViewType, label: "Kanban", icon: Columns3 },
    { id: "calendar" as ViewType, label: "Calendar", icon: Calendar },
    { id: "timeline" as ViewType, label: "Timeline", icon: GanttChart },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.id}
            variant={currentView === view.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(view.id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {view.label}
          </Button>
        );
      })}
    </div>
  );
}
