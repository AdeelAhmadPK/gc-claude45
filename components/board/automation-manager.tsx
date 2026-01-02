"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Plus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Column {
  id: string;
  title: string;
  type: string;
  settings?: any;
}

interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    type: "status_changed" | "date_arrives" | "item_created" | "column_changed";
    columnId?: string;
    value?: any;
  };
  actions: Array<{
    type: "set_status" | "set_date" | "assign_user" | "send_notification" | "move_item";
    columnId?: string;
    value?: any;
  }>;
}

interface AutomationManagerProps {
  boardId: string;
  workspaceId: string;
  columns: Column[];
}

export function AutomationManager({ boardId, workspaceId, columns }: AutomationManagerProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [open, setOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  // New automation form state
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<Automation["trigger"]["type"]>("status_changed");
  const [triggerColumn, setTriggerColumn] = useState("");
  const [actionType, setActionType] = useState<Automation["actions"][0]["type"]>("set_status");
  const [actionColumn, setActionColumn] = useState("");

  const handleCreateAutomation = () => {
    if (!name || !triggerColumn || !actionColumn) return;

    const newAutomation: Automation = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      enabled: true,
      trigger: {
        type: triggerType,
        columnId: triggerColumn,
      },
      actions: [
        {
          type: actionType,
          columnId: actionColumn,
        },
      ],
    };

    setAutomations([...automations, newAutomation]);
    resetForm();
    setOpen(false);

    // In production, save to backend
    // await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/automations`, {
    //   method: 'POST',
    //   body: JSON.stringify(newAutomation)
    // });
  };

  const handleToggleAutomation = (id: string) => {
    setAutomations(
      automations.map((auto) =>
        auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
      )
    );
  };

  const handleDeleteAutomation = (id: string) => {
    setAutomations(automations.filter((auto) => auto.id !== id));
  };

  const resetForm = () => {
    setName("");
    setTriggerColumn("");
    setActionColumn("");
    setEditingAutomation(null);
  };

  const getTriggerLabel = (trigger: Automation["trigger"]) => {
    const column = columns.find((c) => c.id === trigger.columnId);
    switch (trigger.type) {
      case "status_changed":
        return `When ${column?.title || "status"} changes`;
      case "date_arrives":
        return `When ${column?.title || "date"} arrives`;
      case "item_created":
        return "When item is created";
      case "column_changed":
        return `When ${column?.title || "column"} changes`;
      default:
        return "Unknown trigger";
    }
  };

  const getActionLabel = (action: Automation["actions"][0]) => {
    const column = columns.find((c) => c.id === action.columnId);
    switch (action.type) {
      case "set_status":
        return `Set ${column?.title || "status"}`;
      case "set_date":
        return `Set ${column?.title || "date"}`;
      case "assign_user":
        return "Assign user";
      case "send_notification":
        return "Send notification";
      case "move_item":
        return "Move item";
      default:
        return "Unknown action";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Automations
          </h3>
          <Badge variant="secondary">{automations.length}</Badge>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Automation Name</Label>
                <Input
                  placeholder="e.g., Notify when task is done"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Trigger */}
              <div className="space-y-2">
                <Label>When this happens...</Label>
                <Select value={triggerType} onValueChange={(value: any) => setTriggerType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status_changed">Status changes</SelectItem>
                    <SelectItem value="date_arrives">Date arrives</SelectItem>
                    <SelectItem value="item_created">Item is created</SelectItem>
                    <SelectItem value="column_changed">Column changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>In column</Label>
                <Select value={triggerColumn} onValueChange={setTriggerColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div className="space-y-2 pt-4 border-t">
                <Label>Do this...</Label>
                <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set_status">Set status</SelectItem>
                    <SelectItem value="set_date">Set date</SelectItem>
                    <SelectItem value="assign_user">Assign user</SelectItem>
                    <SelectItem value="send_notification">Send notification</SelectItem>
                    <SelectItem value="move_item">Move item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To column</Label>
                <Select value={actionColumn} onValueChange={setActionColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.title} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAutomation}>Create Automation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Automation List */}
      <div className="space-y-2">
        {automations.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No automations yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create automations to automate repetitive tasks
            </p>
          </Card>
        ) : (
          automations.map((automation) => (
            <Card
              key={automation.id}
              className={`p-4 ${
                !automation.enabled ? "opacity-50 bg-gray-50 dark:bg-gray-800/50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Zap
                    className={`h-5 w-5 mt-0.5 ${
                      automation.enabled ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {automation.name}
                    </h4>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">When:</span> {getTriggerLabel(automation.trigger)}
                      {" → "}
                      <span className="font-medium">Then:</span>{" "}
                      {automation.actions.map(getActionLabel).join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAutomation(automation.id)}
                  >
                    {automation.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAutomation(automation.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
