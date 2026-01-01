"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  Link2,
  Paperclip,
  CheckSquare,
  AlertCircle,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Activity,
  GitBranch,
  Timer,
  Plus,
  X,
  Share2,
  Copy,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { UpdatesTab } from "./updates-tab";
import { FilesTab } from "./files-tab";
import { ActivityLogTab } from "./activity-log-tab";

interface ItemDrawerProps {
  itemId: string;
  boardId: string;
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

interface ItemData {
  id: string;
  name: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  startDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  completedAt: string | null;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  assignments: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  subitems: Array<{
    id: string;
    name: string;
    completedAt: string | null;
  }>;
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }>;
  files: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    createdAt: string;
  }>;
  timeEntries: Array<{
    id: string;
    hours: number;
    description: string | null;
    date: string;
    user: {
      name: string | null;
    };
  }>;
  blockedBy: Array<{
    id: string;
    dependsOn: {
      id: string;
      name: string;
    };
  }>;
  blocking: Array<{
    id: string;
    item: {
      id: string;
      name: string;
    };
  }>;
  activityLogs: Array<{
    id: string;
    action: string;
    metadata: any;
    createdAt: string;
  }>;
}

export function ItemDrawer({
  itemId,
  boardId,
  workspaceId,
  open,
  onClose,
}: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [newSubitem, setNewSubitem] = useState("");

  useEffect(() => {
    if (open && itemId) {
      fetchItemDetails();
    }
  }, [open, itemId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/details`
      );
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (updates: Partial<ItemData>) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (response.ok) {
        fetchItemDetails();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newComment }),
        }
      );
      if (response.ok) {
        setNewComment("");
        fetchItemDetails();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const addSubitem = async () => {
    if (!newSubitem.trim()) return;
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/subitems`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newSubitem }),
        }
      );
      if (response.ok) {
        setNewSubitem("");
        fetchItemDetails();
      }
    } catch (error) {
      console.error("Error adding subitem:", error);
    }
  };

  const addTimeEntry = async (hours: number, description: string) => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/time`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hours, description }),
        }
      );
      if (response.ok) {
        fetchItemDetails();
      }
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "HIGH":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "LOW":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  if (!item && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Input
                value={item?.name || ""}
                onChange={(e) => updateItem({ name: e.target.value })}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                placeholder="Task name..."
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(item?.priority || "NONE")}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {item?.priority || "No Priority"}
                </Badge>
                {item?.completedAt && (
                  <Badge className="bg-green-500/20 text-green-700">
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
                {item?.dueDate && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Due {format(new Date(item.dueDate), "MMM d, yyyy")}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="updates">
              <MessageSquare className="w-4 h-4 mr-1" />
              Updates {item?.comments?.length ? `(${item.comments.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="files">
              <Paperclip className="w-4 h-4 mr-1" />
              Files {item?.files?.length ? `(${item.files.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="space-y-6 mt-0 px-6 pb-6">
              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={item?.description || ""}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  placeholder="Add a description..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={item?.priority || "NONE"}
                    onValueChange={(value) => updateItem({ priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                      <SelectItem value="HIGH">🟠 High</SelectItem>
                      <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                      <SelectItem value="LOW">🟢 Low</SelectItem>
                      <SelectItem value="NONE">⚪ None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <Input
                    type="date"
                    value={item?.dueDate ? format(new Date(item.dueDate), "yyyy-MM-dd") : ""}
                    onChange={(e) => updateItem({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={item?.startDate ? format(new Date(item.startDate), "yyyy-MM-dd") : ""}
                    onChange={(e) => updateItem({ startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={item?.completedAt ? "completed" : "in_progress"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned To</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {item?.assignments?.map((assignment) => (
                    <div
                      key={assignment.user.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={assignment.user.image || undefined} />
                        <AvatarFallback>
                          {assignment.user.name?.[0] || assignment.user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignment.user.name || assignment.user.email}</span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                </div>
              </div>

              {/* Time Tracking Summary */}
              <div>
                <label className="text-sm font-medium mb-2 block">Time Tracking</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1">Estimated</div>
                    <div className="text-lg font-bold text-blue-700">{item?.estimatedHours || 0}h</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-green-600 mb-1">Logged</div>
                    <div className="text-lg font-bold text-green-700">{item?.actualHours || 0}h</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-xs text-orange-600 mb-1">Remaining</div>
                    <div className="text-lg font-bold text-orange-700">
                      {Math.max(0, (item?.estimatedHours || 0) - (item?.actualHours || 0))}h
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtasks Progress */}
              {item?.subitems && item.subitems.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Subtasks</label>
                  <div className="space-y-2">
                    {item.subitems.slice(0, 3).map((subitem) => (
                      <div key={subitem.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!subitem.completedAt}
                          className="w-4 h-4 rounded"
                          readOnly
                        />
                        <span className={`text-sm ${subitem.completedAt ? "line-through text-muted-foreground" : ""}`}>
                          {subitem.name}
                        </span>
                      </div>
                    ))}
                    {item.subitems.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{item.subitems.length - 3} more subtasks</p>
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>
                          {item.subitems.filter((s) => s.completedAt).length} / {item.subitems.length}
                        </span>
                      </div>
                      <Progress
                        value={(item.subitems.filter((s) => s.completedAt).length / item.subitems.length) * 100}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dependencies Summary */}
              {((item?.blockedBy && item.blockedBy.length > 0) || (item?.blocking && item.blocking.length > 0)) && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Dependencies</label>
                  <div className="space-y-2">
                    {item?.blockedBy && item.blockedBy.length > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Blocked by {item.blockedBy.length} task(s)</span>
                        </div>
                      </div>
                    )}
                    {item?.blocking && item.blocking.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <GitBranch className="w-4 h-4" />
                          <span className="text-sm font-medium">Blocking {item.blocking.length} task(s)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="mt-0 px-6 pb-6">
              <UpdatesTab
                itemId={itemId}
                workspaceId={workspaceId}
                boardId={boardId}
                currentUserId="current-user-id" // TODO: Get from session
                currentUserName="Current User" // TODO: Get from session
                currentUserImage={undefined}
                teamMembers={[]} // TODO: Fetch team members
              />
            </TabsContent>

            <TabsContent value="files" className="mt-0 px-6 pb-6">
              <FilesTab
                itemId={itemId}
                workspaceId={workspaceId}
                boardId={boardId}
                currentUserId="current-user-id" // TODO: Get from session
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0 px-6 pb-6">
              <ActivityLogTab
                itemId={itemId}
                workspaceId={workspaceId}
                boardId={boardId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};