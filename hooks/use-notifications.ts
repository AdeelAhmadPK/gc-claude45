"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@/components/notifications/notification-center";

// Mock data for development
const generateMockNotifications = (): Notification[] => [
  {
    id: "1",
    type: "mention",
    title: "Sarah Chen mentioned you",
    message: "Can you review this design? @you I think we need your input on the color scheme.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: {
      id: "user-1",
      name: "Sarah Chen",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    item: {
      id: "item-1",
      name: "Homepage Redesign",
    },
  },
  {
    id: "2",
    type: "assignment",
    title: "You were assigned to a task",
    message: "Mike Johnson assigned you to 'API Integration'",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actor: {
      id: "user-2",
      name: "Mike Johnson",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    item: {
      id: "item-2",
      name: "API Integration",
    },
  },
  {
    id: "3",
    type: "due_date",
    title: "Due date approaching",
    message: "User Authentication is due in 2 hours",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    item: {
      id: "item-3",
      name: "User Authentication",
    },
  },
  {
    id: "4",
    type: "comment",
    title: "New comment on your item",
    message: "Emma Wilson commented on 'Database Schema Design'",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    actor: {
      id: "user-3",
      name: "Emma Wilson",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    },
    item: {
      id: "item-4",
      name: "Database Schema Design",
    },
  },
  {
    id: "5",
    type: "status_change",
    title: "Status changed",
    message: "Payment Gateway moved from Working to Done",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    item: {
      id: "item-5",
      name: "Payment Gateway",
    },
  },
  {
    id: "6",
    type: "file",
    title: "New file uploaded",
    message: "Tom Brown uploaded design-mockup-v2.fig to 'Mobile App Design'",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    actor: {
      id: "user-4",
      name: "Tom Brown",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    },
    item: {
      id: "item-6",
      name: "Mobile App Design",
    },
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize with mock data
  useEffect(() => {
    // In a real app, fetch from API: /api/notifications
    const mockData = generateMockNotifications();
    setNotifications(mockData);
    setLoading(false);
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, fetch new notifications from API
      // For now, we'll just keep the mock data
      console.log("Polling for new notifications...");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // In a real app: await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // In a real app: await fetch('/api/notifications/read-all', { method: 'POST' })
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // In a real app: await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
}

// Notification settings hook
interface NotificationSettings {
  mentions: { email: boolean; inApp: boolean };
  assignments: { email: boolean; inApp: boolean };
  comments: { email: boolean; inApp: boolean };
  dueDates: { email: boolean; inApp: boolean };
  statusChanges: { email: boolean; inApp: boolean };
}

const defaultSettings: NotificationSettings = {
  mentions: { email: true, inApp: true },
  assignments: { email: true, inApp: true },
  comments: { email: false, inApp: true },
  dueDates: { email: true, inApp: true },
  statusChanges: { email: false, inApp: true },
};

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API: /api/user/notification-settings
    // For now, load from localStorage
    const saved = localStorage.getItem("notificationSettings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notification settings:", e);
      }
    }
    setLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
    // In a real app: await fetch('/api/user/notification-settings', { method: 'PUT', body: JSON.stringify(newSettings) })
  }, []);

  return {
    settings,
    loading,
    updateSettings,
  };
}
