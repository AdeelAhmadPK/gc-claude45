"use client";

import { NotificationCenter } from "@/components/notifications/notification-center";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  UserPlus,
  Calendar,
  CheckCircle2,
  FileText,
  Zap,
} from "lucide-react";

export default function NotificationsDemo() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotifications();

  const handleSettingsClick = () => {
    router.push("/settings/notifications");
  };

  const triggerTestNotification = (type: string) => {
    const notificationMap: Record<string, any> = {
      mention: {
        type: "mention",
        title: "Test Mention",
        message: "@you Check out the new design mockups!",
        isRead: false,
        createdAt: new Date().toISOString(),
        actor: {
          id: "test-user",
          name: "Test User",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Test",
        },
        item: {
          id: "test-item",
          name: "Test Item",
        },
      },
      assignment: {
        type: "assignment",
        title: "New Assignment",
        message: "You were assigned to complete the integration task",
        isRead: false,
        createdAt: new Date().toISOString(),
        actor: {
          id: "test-user",
          name: "Project Manager",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=PM",
        },
        item: {
          id: "test-item",
          name: "API Integration",
        },
      },
      dueDate: {
        type: "due_date",
        title: "Due Date Alert",
        message: "Test Task is due in 1 hour!",
        isRead: false,
        createdAt: new Date().toISOString(),
        item: {
          id: "test-item",
          name: "Test Task",
        },
      },
      comment: {
        type: "comment",
        title: "New Comment",
        message: "Someone commented on your task",
        isRead: false,
        createdAt: new Date().toISOString(),
        actor: {
          id: "test-user",
          name: "Team Member",
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Member",
        },
        item: {
          id: "test-item",
          name: "Code Review",
        },
      },
      status: {
        type: "status_change",
        title: "Status Updated",
        message: "Your task moved from In Progress to Done",
        isRead: false,
        createdAt: new Date().toISOString(),
        item: {
          id: "test-item",
          name: "Feature Development",
        },
      },
    };

    const notification = notificationMap[type];
    if (notification) {
      addNotification(notification);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications System</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated on everything happening in your workspace
            </p>
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onSettingsClick={handleSettingsClick}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Notifications
              </p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Test Notification Triggers */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Test Notifications</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Click the buttons below to trigger different types of notifications
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            variant="outline"
            onClick={() => triggerTestNotification("mention")}
            className="flex flex-col h-auto py-4 gap-2"
          >
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Mention</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => triggerTestNotification("assignment")}
            className="flex flex-col h-auto py-4 gap-2"
          >
            <UserPlus className="h-5 w-5 text-purple-600" />
            <span className="text-xs">Assignment</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => triggerTestNotification("dueDate")}
            className="flex flex-col h-auto py-4 gap-2"
          >
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-xs">Due Date</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => triggerTestNotification("comment")}
            className="flex flex-col h-auto py-4 gap-2"
          >
            <MessageSquare className="h-5 w-5 text-green-600" />
            <span className="text-xs">Comment</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => triggerTestNotification("status")}
            className="flex flex-col h-auto py-4 gap-2"
          >
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Status</span>
          </Button>
        </div>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Real-time Updates
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Instant notification delivery</li>
            <li>• Auto-polling every 30 seconds</li>
            <li>• Visual unread count badge</li>
            <li>• Persistent notification history</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Smart Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Mark individual or all as read</li>
            <li>• Delete unwanted notifications</li>
            <li>• Grouped by notification type</li>
            <li>• Rich actor and item context</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Notification Types
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• @Mentions in comments</li>
            <li>• Task assignments</li>
            <li>• Due date reminders</li>
            <li>• Status changes</li>
            <li>• New comments & files</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Customization
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Email & in-app preferences</li>
            <li>• Per-category settings</li>
            <li>• Email digest options</li>
            <li>• Quiet hours scheduling</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
