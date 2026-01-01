"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap,
  Plus,
  X,
  Clock,
  Calendar,
  UserPlus,
  Tag,
  CheckCircle,
  Mail,
  MessageSquare,
  Copy,
  Archive,
  Trash2,
  GitBranch,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

interface AutomationTrigger {
  type: "status_change" | "date_arrives" | "item_created" | "item_moved" | "column_changed" | "assignment_added" | "due_date_approaching" | "file_uploaded";
  config: Record<string, any>;
}

interface AutomationCondition {
  id: string;
  type: "status_is" | "priority_is" | "assignee_is" | "column_value" | "date_is" | "has_label" | "is_overdue";
  config: Record<string, any>;
  operator?: "AND" | "OR";
}

interface AutomationAction {
  id: string;
  type: "change_status" | "assign_person" | "add_label" | "send_notification" | "create_item" | "duplicate_item" | "archive_item" | "delete_item" | "move_to_group" | "add_update" | "change_column";
  config: Record<string, any>;
}

interface AutomationBuilderProps {
  boardId: string;
  workspaceId: string;
  onSave: (automation: Partial<Automation>) => void;
  onClose: () => void;
}

const TRIGGER_TYPES = [
  { value: "status_change", label: "When status changes", icon: CheckCircle },
  { value: "date_arrives", label: "When date arrives", icon: Calendar },
  { value: "item_created", label: "When item is created", icon: Plus },
  { value: "item_moved", label: "When item is moved to group", icon: GitBranch },
  { value: "column_changed", label: "When column changes", icon: Tag },
  { value: "assignment_added", label: "When person is assigned", icon: UserPlus },
  { value: "due_date_approaching", label: "When due date is approaching", icon: Clock },
  { value: "file_uploaded", label: "When file is uploaded", icon: Copy },
];

const CONDITION_TYPES = [
  { value: "status_is", label: "Status is" },
  { value: "priority_is", label: "Priority is" },
  { value: "assignee_is", label: "Assignee is" },
  { value: "has_label", label: "Has label" },
  { value: "is_overdue", label: "Is overdue" },
  { value: "date_is", label: "Date is" },
];

const ACTION_TYPES = [
  { value: "change_status", label: "Change status", icon: CheckCircle },
  { value: "assign_person", label: "Assign person", icon: UserPlus },
  { value: "add_label", label: "Add label", icon: Tag },
  { value: "send_notification", label: "Send notification", icon: Mail },
  { value: "create_item", label: "Create item", icon: Plus },
  { value: "duplicate_item", label: "Duplicate item", icon: Copy },
  { value: "move_to_group", label: "Move to group", icon: GitBranch },
  { value: "add_update", label: "Add update", icon: MessageSquare },
  { value: "archive_item", label: "Archive item", icon: Archive },
  { value: "delete_item", label: "Delete item", icon: Trash2 },
];

export function AutomationBuilder({ boardId, workspaceId, onSave, onClose }: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger | null>(null);
  const [conditions, setConditions] = useState<AutomationCondition[]>([]);
  const [actions, setActions] = useState<AutomationAction[]>([]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Math.random().toString(),
        type: "status_is",
        config: {},
        operator: conditions.length > 0 ? "AND" : undefined,
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        id: Math.random().toString(),
        type: "change_status",
        config: {},
      },
    ]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    if (!name || !trigger || actions.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name,
      trigger,
      conditions,
      actions,
      isActive: true,
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Create Automation
        </DialogTitle>
        <DialogDescription>
          Build automated workflows to save time and reduce manual work
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Automation Name */}
        <div>
          <Label htmlFor="name">Automation Name</Label>
          <Input
            id="name"
            placeholder="e.g., Notify team when high priority item is created"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Trigger */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            <Clock className="h-4 w-4 inline mr-2" />
            When this happens (Trigger)
          </Label>
          <Select
            value={trigger?.type}
            onValueChange={(value) =>
              setTrigger({ type: value as any, config: {} })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trigger..." />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex items-center gap-2">
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {trigger && (
            <Card className="mt-3 p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                <AlertCircle className="h-4 w-4" />
                <span>
                  This automation will run every time{" "}
                  <strong>
                    {TRIGGER_TYPES.find((t) => t.value === trigger.type)?.label.toLowerCase()}
                  </strong>
                </span>
              </div>
            </Card>
          )}
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">
              <GitBranch className="h-4 w-4 inline mr-2" />
              Only if (Conditions - Optional)
            </Label>
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                No conditions added. Automation will run for all triggers.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <Card key={condition.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {index > 0 && (
                      <Badge variant="outline" className="px-2 py-1">
                        {condition.operator}
                      </Badge>
                    )}
                    <Select
                      value={condition.type}
                      onValueChange={(value) => {
                        const newConditions = [...conditions];
                        newConditions[index].type = value as any;
                        setConditions(newConditions);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_TYPES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value..."
                      className="flex-1"
                      value={condition.config.value || ""}
                      onChange={(e) => {
                        const newConditions = [...conditions];
                        newConditions[index].config = { value: e.target.value };
                        setConditions(newConditions);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">
              <Zap className="h-4 w-4 inline mr-2 text-yellow-500" />
              Do this (Actions)
            </Label>
            <Button variant="outline" size="sm" onClick={addAction}>
              <Plus className="h-4 w-4 mr-1" />
              Add Action
            </Button>
          </div>

          {actions.length === 0 ? (
            <Card className="p-4 text-center text-red-500 dark:text-red-400 border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              <p className="text-sm font-medium">At least one action is required</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {actions.map((action, index) => {
                const actionType = ACTION_TYPES.find((a) => a.value === action.type);
                return (
                  <Card key={action.id} className="p-4">
                    <div className="flex items-center gap-3">
                      {actionType && <actionType.icon className="h-5 w-5 text-gray-500" />}
                      <Select
                        value={action.type}
                        onValueChange={(value) => {
                          const newActions = [...actions];
                          newActions[index].type = value as any;
                          setActions(newActions);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              <div className="flex items-center gap-2">
                                <a.icon className="h-4 w-4" />
                                {a.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Configure action..."
                        className="flex-1"
                        value={action.config.value || ""}
                        onChange={(e) => {
                          const newActions = [...actions];
                          newActions[index].config = { value: e.target.value };
                          setActions(newActions);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(action.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview */}
        {trigger && actions.length > 0 && (
          <Card className="p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold mb-2">Automation Preview:</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>When:</strong>{" "}
                {TRIGGER_TYPES.find((t) => t.value === trigger.type)?.label}
              </p>
              {conditions.length > 0 && (
                <p>
                  <strong>If:</strong>{" "}
                  {conditions.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ` ${c.operator} `}
                      {CONDITION_TYPES.find((ct) => ct.value === c.type)?.label}
                    </span>
                  ))}
                </p>
              )}
              <p>
                <strong>Then:</strong>{" "}
                {actions.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && ", "}
                    {ACTION_TYPES.find((at) => at.value === a.type)?.label}
                  </span>
                ))}
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !trigger || actions.length === 0}>
            <Zap className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
