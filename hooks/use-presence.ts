"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  color: string;
}

export interface Presence {
  userId: string;
  user: User;
  cursor?: { x: number; y: number };
  viewingItemId?: string;
  viewingBoardId?: string;
  lastSeen: number;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    color: "#3b82f6", // blue
  },
  {
    id: "user-2",
    name: "Mike Johnson",
    email: "mike@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    color: "#10b981", // green
  },
  {
    id: "user-3",
    name: "Emma Wilson",
    email: "emma@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    color: "#f59e0b", // orange
  },
  {
    id: "user-4",
    name: "Tom Brown",
    email: "tom@example.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    color: "#8b5cf6", // purple
  },
];

export function usePresence(boardId?: string, itemId?: string) {
  const [presences, setPresences] = useState<Record<string, Presence>>({});
  const [currentUser] = useState<User>(mockUsers[0]); // Current user is Sarah

  // Simulate other users being present
  useEffect(() => {
    // Add some initial presences
    const initialPresences: Record<string, Presence> = {};
    
    // Simulate 1-2 other users online
    const onlineUsers = mockUsers.slice(1, 3);
    onlineUsers.forEach((user) => {
      initialPresences[user.id] = {
        userId: user.id,
        user,
        viewingBoardId: boardId,
        lastSeen: Date.now(),
      };
    });

    setPresences(initialPresences);

    // Simulate users coming and going
    const interval = setInterval(() => {
      setPresences((prev) => {
        const newPresences = { ...prev };
        
        // Randomly add/remove users
        if (Math.random() > 0.7) {
          const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
          if (randomUser.id !== currentUser.id) {
            newPresences[randomUser.id] = {
              userId: randomUser.id,
              user: randomUser,
              viewingBoardId: boardId,
              viewingItemId: Math.random() > 0.5 ? itemId : undefined,
              lastSeen: Date.now(),
            };
          }
        }

        // Remove old presences (older than 30 seconds)
        const now = Date.now();
        Object.keys(newPresences).forEach((userId) => {
          if (now - newPresences[userId].lastSeen > 30000) {
            delete newPresences[userId];
          }
        });

        return newPresences;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [boardId, itemId, currentUser.id]);

  const updateCursor = useCallback((x: number, y: number) => {
    // In a real app, broadcast cursor position via WebSocket
    console.log("Cursor moved:", { x, y });
  }, []);

  const updatePresence = useCallback((updates: Partial<Omit<Presence, "userId" | "user">>) => {
    // In a real app, broadcast presence updates via WebSocket
    console.log("Presence updated:", updates);
  }, []);

  const onlineUsers = Object.values(presences).map((p) => p.user);

  return {
    presences,
    onlineUsers,
    currentUser,
    updateCursor,
    updatePresence,
  };
}

// Hook for live editing indicators
export function useLiveEditing(itemId: string) {
  const [editingUsers, setEditingUsers] = useState<Record<string, { user: User; field: string }>>({});

  useEffect(() => {
    // Simulate users editing fields
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUser = mockUsers[Math.floor(Math.random() * (mockUsers.length - 1)) + 1];
        const fields = ["title", "description", "status", "assignee"];
        const randomField = fields[Math.floor(Math.random() * fields.length)];
        
        setEditingUsers((prev) => ({
          ...prev,
          [randomUser.id]: {
            user: randomUser,
            field: randomField,
          },
        }));

        // Clear after 3 seconds
        setTimeout(() => {
          setEditingUsers((prev) => {
            const next = { ...prev };
            delete next[randomUser.id];
            return next;
          });
        }, 3000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [itemId]);

  const isFieldBeingEdited = useCallback(
    (field: string) => {
      return Object.values(editingUsers).some((e) => e.field === field);
    },
    [editingUsers]
  );

  const getFieldEditor = useCallback(
    (field: string) => {
      const editor = Object.values(editingUsers).find((e) => e.field === field);
      return editor?.user;
    },
    [editingUsers]
  );

  return {
    editingUsers,
    isFieldBeingEdited,
    getFieldEditor,
  };
}

// Hook for activity stream
export interface Activity {
  id: string;
  userId: string;
  user: User;
  action: "viewed" | "edited" | "commented" | "joined" | "left";
  target?: string;
  timestamp: number;
}

export function useActivityStream(boardId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate activity stream
    const actions: Activity["action"][] = ["viewed", "edited", "commented", "joined", "left"];
    
    const interval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        userId: randomUser.id,
        user: randomUser,
        action: randomAction,
        target: randomAction === "edited" ? "Item Title" : randomAction === "commented" ? "Task Discussion" : undefined,
        timestamp: Date.now(),
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 20)); // Keep last 20
    }, 10000);

    return () => clearInterval(interval);
  }, [boardId]);

  return { activities };
}
