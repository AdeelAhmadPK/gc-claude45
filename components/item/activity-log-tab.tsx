"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Download,
  CheckCircle2,
  UserPlus,
  Calendar,
  FileText,
  MessageCircle,
  Tag,
  Archive,
  Edit,
  Trash2,
  Link as LinkIcon,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";

interface ActivityItem {
  id: string;
  type:
    | "status_change"
    | "assignment"
    | "due_date"
    | "file_upload"
    | "comment"
    | "label"
    | "archive"
    | "edit"
    | "delete"
    | "link"
    | "created";
  userId: string;
  userName: string;
  userImage?: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface ActivityLogTabProps {
  itemId: string;
  workspaceId: string;
  boardId: string;
}

export function ActivityLogTab({
  itemId,
  workspaceId,
  boardId,
}: ActivityLogTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "created",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      action: "created this task",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "status_change",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      action: "changed status from",
      metadata: { from: "To Do", to: "In Progress" },
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "assignment",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      action: "assigned to",
      metadata: { assignee: "John Doe" },
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "due_date",
      userId: "user2",
      userName: "John Doe",
      userImage: "https://avatar.vercel.sh/john",
      action: "set due date to",
      metadata: { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "5",
      type: "file_upload",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      action: "uploaded file",
      metadata: { fileName: "design-mockup-v1.fig" },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "6",
      type: "comment",
      userId: "user3",
      userName: "Alice Smith",
      userImage: "https://avatar.vercel.sh/alice",
      action: "posted a comment",
      metadata: { preview: "Looks great! Just a few minor changes..." },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "7",
      type: "label",
      userId: "user2",
      userName: "John Doe",
      userImage: "https://avatar.vercel.sh/john",
      action: "added label",
      metadata: { label: "High Priority", color: "#EF4444" },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: "8",
      type: "edit",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      action: "updated description",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ]);

  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterUsers, setFilterUsers] = useState<string[]>([]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "assignment":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case "due_date":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case "file_upload":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "label":
        return <Tag className="h-4 w-4 text-pink-500" />;
      case "archive":
        return <Archive className="h-4 w-4 text-gray-500" />;
      case "edit":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "link":
        return <LinkIcon className="h-4 w-4 text-indigo-500" />;
      case "created":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderActivityDetails = (activity: ActivityItem) => {
    switch (activity.type) {
      case "status_change":
        return (
          <>
            {activity.action}{" "}
            <span className="inline-flex items-center gap-1">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">
                {activity.metadata?.from}
              </span>
              <span className="text-gray-400">→</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
                {activity.metadata?.to}
              </span>
            </span>
          </>
        );

      case "assignment":
        return (
          <>
            {activity.action}{" "}
            <span className="font-medium text-gray-900">
              {activity.metadata?.assignee}
            </span>
          </>
        );

      case "due_date":
        return (
          <>
            {activity.action}{" "}
            <span className="font-medium text-gray-900">
              {activity.metadata?.date &&
                format(new Date(activity.metadata.date), "MMM dd, yyyy")}
            </span>
          </>
        );

      case "file_upload":
        return (
          <>
            {activity.action}{" "}
            <span className="font-medium text-gray-900">
              {activity.metadata?.fileName}
            </span>
          </>
        );

      case "comment":
        return (
          <div>
            <p>{activity.action}</p>
            {activity.metadata?.preview && (
              <p className="text-sm text-gray-500 mt-1 italic">
                "{activity.metadata.preview}"
              </p>
            )}
          </div>
        );

      case "label":
        return (
          <>
            {activity.action}{" "}
            <span
              className="px-2 py-0.5 rounded text-sm text-white"
              style={{ backgroundColor: activity.metadata?.color }}
            >
              {activity.metadata?.label}
            </span>
          </>
        );

      default:
        return activity.action;
    }
  };

  const toggleFilterType = (type: string) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleFilterUser = (userId: string) => {
    setFilterUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((u) => u !== userId)
        : [...prev, userId]
    );
  };

  const filteredActivities = activities.filter((activity) => {
    if (filterTypes.length > 0 && !filterTypes.includes(activity.type))
      return false;
    if (filterUsers.length > 0 && !filterUsers.includes(activity.userId))
      return false;
    return true;
  });

  const uniqueUsers = Array.from(
    new Set(activities.map((a) => a.userId))
  ).map((userId) => {
    const user = activities.find((a) => a.userId === userId);
    return {
      id: userId,
      name: user?.userName || "",
      image: user?.userImage,
    };
  });

  const exportLog = () => {
    // TODO: Export activity log as CSV or PDF
    console.log("Export activity log");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Action
                {filterTypes.length > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5">
                    {filterTypes.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("status_change")}
                onCheckedChange={() => toggleFilterType("status_change")}
              >
                Status Changes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("assignment")}
                onCheckedChange={() => toggleFilterType("assignment")}
              >
                Assignments
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("due_date")}
                onCheckedChange={() => toggleFilterType("due_date")}
              >
                Due Dates
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("file_upload")}
                onCheckedChange={() => toggleFilterType("file_upload")}
              >
                File Uploads
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("comment")}
                onCheckedChange={() => toggleFilterType("comment")}
              >
                Comments
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("label")}
                onCheckedChange={() => toggleFilterType("label")}
              >
                Labels
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterTypes.includes("edit")}
                onCheckedChange={() => toggleFilterType("edit")}
              >
                Edits
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Filter by User
                {filterUsers.length > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5">
                    {filterUsers.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {uniqueUsers.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={filterUsers.includes(user.id)}
                  onCheckedChange={() => toggleFilterUser(user.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(filterTypes.length > 0 || filterUsers.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterTypes([]);
                setFilterUsers([]);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={exportLog}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[21px] top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activities */}
        <div className="space-y-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No activity found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div className="relative flex-shrink-0">
                  <div className="h-11 w-11 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.userImage} />
                        <AvatarFallback className="text-xs">
                          {activity.userName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm text-gray-900">
                        {activity.userName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="text-sm text-gray-600 ml-8">
                    {renderActivityDetails(activity)}
                  </div>

                  <p className="text-xs text-gray-400 ml-8 mt-1">
                    {format(activity.createdAt, "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
