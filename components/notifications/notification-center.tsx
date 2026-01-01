"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  MessageSquare,
  UserPlus,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
  Trash2,
  Settings,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "mention" | "assignment" | "comment" | "due_date" | "status_change" | "file" | "update" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actor?: {
    id: string;
    name: string;
    image?: string;
  };
  item?: {
    id: string;
    name: string;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onSettingsClick: () => void;
}

const getNotificationIcon = (type: Notification["type"]) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case "mention":
      return <MessageSquare className={cn(iconClass, "text-blue-600")} />;
    case "assignment":
      return <UserPlus className={cn(iconClass, "text-purple-600")} />;
    case "comment":
      return <MessageSquare className={cn(iconClass, "text-green-600")} />;
    case "due_date":
      return <Calendar className={cn(iconClass, "text-orange-600")} />;
    case "status_change":
      return <CheckCircle2 className={cn(iconClass, "text-blue-600")} />;
    case "file":
      return <FileText className={cn(iconClass, "text-gray-600")} />;
    case "update":
      return <AlertCircle className={cn(iconClass, "text-yellow-600")} />;
    case "system":
      return <Bell className={cn(iconClass, "text-gray-600")} />;
    default:
      return <Bell className={iconClass} />;
  }
};

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onSettingsClick,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-900 dark:text-gray-100">
                No notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative group",
        !notification.isRead && "bg-blue-50 dark:bg-blue-950"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Icon or Avatar */}
        <div className="flex-shrink-0">
          {notification.actor ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.actor.image} />
              <AvatarFallback>
                {notification.actor.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              {notification.item && (
                <div className="flex items-center gap-1 mt-2">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.item.name}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>

          {/* Action buttons - show on hover */}
          {showActions && (
            <div className="flex items-center gap-1 mt-2">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-7 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Settings Component
interface NotificationSettingsProps {
  settings: {
    mentions: { email: boolean; inApp: boolean };
    assignments: { email: boolean; inApp: boolean };
    comments: { email: boolean; inApp: boolean };
    dueDates: { email: boolean; inApp: boolean };
    statusChanges: { email: boolean; inApp: boolean };
  };
  onUpdate: (settings: any) => void;
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const categories = [
    {
      key: "mentions",
      label: "Mentions",
      description: "When someone mentions you in a comment",
      icon: MessageSquare,
    },
    {
      key: "assignments",
      label: "Assignments",
      description: "When you're assigned to an item",
      icon: UserPlus,
    },
    {
      key: "comments",
      label: "Comments",
      description: "New comments on items you follow",
      icon: MessageSquare,
    },
    {
      key: "dueDates",
      label: "Due Dates",
      description: "When items you're assigned to are due soon",
      icon: Calendar,
    },
    {
      key: "statusChanges",
      label: "Status Changes",
      description: "When status changes on items you follow",
      icon: CheckCircle2,
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Notification Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how you want to be notified about updates
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const categorySetting = settings[category.key as keyof typeof settings];

          return (
            <div key={category.key} className="space-y-3">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{category.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="ml-8 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categorySetting.email}
                    onChange={(e) =>
                      onUpdate({
                        ...settings,
                        [category.key]: {
                          ...categorySetting,
                          email: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Email</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categorySetting.inApp}
                    onChange={(e) =>
                      onUpdate({
                        ...settings,
                        [category.key]: {
                          ...categorySetting,
                          inApp: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">In-app</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
