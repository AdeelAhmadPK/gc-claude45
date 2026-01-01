"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Widget, WidgetType } from "./widgets";
import {
  Plus,
  Layout,
  BarChart3,
  Activity,
  Battery,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  LayoutGrid,
  Trash2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  config?: any;
  position: { x: number; y: number; w: number; h: number };
}

interface DashboardViewProps {
  boardId?: string;
  workspaceId: string;
  widgets: DashboardWidget[];
  onAddWidget: (widget: Partial<DashboardWidget>) => void;
  onRemoveWidget: (id: string) => void;
  onUpdateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
}

const WIDGET_TYPES = [
  { value: "numbers", label: "Numbers", icon: TrendingUp, description: "Display key metrics" },
  { value: "chart", label: "Chart", icon: BarChart3, description: "Line, bar, or pie charts" },
  { value: "battery", label: "Battery", icon: Battery, description: "Show capacity usage" },
  { value: "status", label: "Status", icon: CheckCircle2, description: "Status distribution" },
  { value: "team", label: "Team", icon: Users, description: "Team workload" },
  { value: "timeline", label: "Timeline", icon: Calendar, description: "Upcoming deadlines" },
  { value: "progress", label: "Progress", icon: Target, description: "Overall progress" },
];

const GRID_COLS = 12;
const ROW_HEIGHT = 100;

export function DashboardView({
  boardId,
  workspaceId,
  widgets,
  onAddWidget,
  onRemoveWidget,
  onUpdateWidget,
}: DashboardViewProps) {
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedType, setSelectedType] = useState<WidgetType>("numbers");
  const [widgetTitle, setWidgetTitle] = useState("");
  const [editMode, setEditMode] = useState(false);

  const handleAddWidget = () => {
    if (!widgetTitle) return;

    const newWidget: Partial<DashboardWidget> = {
      type: selectedType,
      title: widgetTitle,
      data: getSampleData(selectedType),
      position: { x: 0, y: 0, w: 4, h: 3 },
    };

    onAddWidget(newWidget);
    setShowAddWidget(false);
    setWidgetTitle("");
    setSelectedType("numbers");
  };

  const getSampleData = (type: WidgetType) => {
    switch (type) {
      case "numbers":
        return {
          value: 42,
          previousValue: 35,
          subtitle: "Total items this month",
        };
      case "chart":
        return {
          data: [
            { name: "Mon", value: 12 },
            { name: "Tue", value: 19 },
            { name: "Wed", value: 15 },
            { name: "Thu", value: 25 },
            { name: "Fri", value: 22 },
          ],
        };
      case "battery":
        return {
          percentage: 75,
          label: "Team Capacity",
          items: [
            { name: "In Progress", value: 15 },
            { name: "Pending", value: 8 },
            { name: "Completed", value: 23 },
          ],
        };
      case "status":
        return {
          statuses: [
            { label: "Done", color: "#10b981", count: 25 },
            { label: "Working on it", color: "#3b82f6", count: 15 },
            { label: "Stuck", color: "#ef4444", count: 5 },
            { label: "Not Started", color: "#94a3b8", count: 10 },
          ],
        };
      case "team":
        return {
          members: [
            { name: "John Doe", taskCount: 8, workload: 80 },
            { name: "Jane Smith", taskCount: 6, workload: 60 },
            { name: "Bob Johnson", taskCount: 10, workload: 100 },
          ],
        };
      case "timeline":
        return {
          items: [
            {
              name: "Q1 Planning Meeting",
              dueDate: "Today, 2:00 PM",
              isOverdue: false,
              isDueSoon: true,
              assignee: "John",
            },
            {
              name: "Design Review",
              dueDate: "Yesterday",
              isOverdue: true,
              isDueSoon: false,
              assignee: "Jane",
            },
            {
              name: "Sprint Planning",
              dueDate: "Tomorrow",
              isOverdue: false,
              isDueSoon: true,
              assignee: "Team",
            },
          ],
        };
      case "progress":
        return {
          progress: 65,
          completed: 13,
          total: 20,
          milestones: [
            { name: "Phase 1", completed: true, dueDate: "Jan 15" },
            { name: "Phase 2", completed: false, dueDate: "Feb 1" },
          ],
        };
      default:
        return {};
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {editMode ? "Done" : "Edit"}
            </Button>
            <Button onClick={() => setShowAddWidget(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="p-6">
        {widgets.length === 0 ? (
          <Card className="p-12 text-center">
            <LayoutGrid className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add your first widget to start visualizing your data
            </p>
            <Button onClick={() => setShowAddWidget(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={cn(
                  "relative group",
                  widget.position.w === 2 && "md:col-span-2",
                  widget.position.w === 3 && "lg:col-span-3",
                  widget.position.w === 4 && "xl:col-span-4",
                  widget.position.h === 2 && "row-span-2"
                )}
                style={{
                  minHeight: `${widget.position.h * ROW_HEIGHT}px`,
                }}
              >
                <Widget
                  type={widget.type}
                  title={widget.title}
                  data={widget.data}
                  config={widget.config}
                />
                {editMode && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveWidget(widget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Widget
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <Label htmlFor="title">Widget Title</Label>
              <Input
                id="title"
                placeholder="e.g., Team Performance"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Widget Type</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {WIDGET_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as WidgetType)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      selectedType === type.value
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                  >
                    <type.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddWidget(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWidget} disabled={!widgetTitle}>
                Add Widget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
