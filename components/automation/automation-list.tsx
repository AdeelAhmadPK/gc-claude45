"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AutomationBuilder } from "./automation-builder";
import {
  Zap,
  Plus,
  MoreHorizontal,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    type: string;
    config: Record<string, any>;
  };
  conditions: any[];
  actions: any[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

interface AutomationListProps {
  boardId: string;
  workspaceId: string;
  automations: Automation[];
  onToggle: (id: string, isActive: boolean) => void;
  onCreate: (automation: Partial<Automation>) => void;
  onUpdate: (id: string, automation: Partial<Automation>) => void;
  onDelete: (id: string) => void;
}

export function AutomationList({
  boardId,
  workspaceId,
  automations,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
}: AutomationListProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      status_change: "Status changes",
      date_arrives: "Date arrives",
      item_created: "Item created",
      item_moved: "Item moved",
      column_changed: "Column changes",
      assignment_added: "Person assigned",
      due_date_approaching: "Due date approaching",
      file_uploaded: "File uploaded",
    };
    return labels[type] || type;
  };

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_status: "Change status",
      assign_person: "Assign person",
      add_label: "Add label",
      send_notification: "Send notification",
      create_item: "Create item",
      duplicate_item: "Duplicate item",
      move_to_group: "Move to group",
      add_update: "Add update",
      archive_item: "Archive",
      delete_item: "Delete",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Automations
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Automate repetitive tasks and workflows
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Automations</p>
              <p className="text-2xl font-bold">{automations.length}</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {automations.filter((a) => a.isActive).length}
              </p>
            </div>
            <Play className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Runs</p>
              <p className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + a.runCount, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Automation Cards */}
      {automations.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first automation to start saving time
          </p>
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => (
            <Card
              key={automation.id}
              className={cn(
                "p-4 transition-all hover:shadow-md",
                !automation.isActive && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap
                      className={cn(
                        "h-5 w-5",
                        automation.isActive ? "text-yellow-500" : "text-gray-400"
                      )}
                    />
                    <h3 className="font-semibold text-lg">{automation.name}</h3>
                    <Badge variant={automation.isActive ? "default" : "outline"}>
                      {automation.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px]">
                        When:
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {getTriggerLabel(automation.trigger.type)}
                      </span>
                    </div>

                    {automation.conditions.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px]">
                          If:
                        </span>
                        <span>
                          {automation.conditions.map((c, i) => (
                            <span key={i}>
                              {i > 0 && ` ${c.operator} `}
                              {c.type.replace(/_/g, " ")}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium min-w-[60px]">
                        Then:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {automation.actions.map((a, i) => (
                          <span key={i}>
                            {i > 0 && ", "}
                            {getActionLabel(a.type)}
                          </span>
                        ))}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {format(new Date(automation.createdAt), "MMM d, yyyy")}
                      </span>
                      {automation.lastRun && (
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Last run {format(new Date(automation.lastRun), "MMM d 'at' h:mm a")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {automation.runCount} runs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={automation.isActive}
                    onCheckedChange={(checked) => onToggle(automation.id, checked)}
                  />
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <AutomationBuilder
          boardId={boardId}
          workspaceId={workspaceId}
          onSave={(automation) => {
            onCreate(automation);
            setShowBuilder(false);
          }}
          onClose={() => setShowBuilder(false)}
        />
      </Dialog>
    </div>
  );
}
