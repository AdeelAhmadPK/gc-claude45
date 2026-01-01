"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PresenceAvatars,
  LiveCursor,
  FieldEditingIndicator,
  ActivityFeed,
  CollaboratorList,
} from "@/components/collaboration/presence-components";
import { usePresence, useLiveEditing, useActivityStream } from "@/hooks/use-presence";
import { Users, Wifi, WifiOff, Eye, Edit3, MousePointer2 } from "lucide-react";

export default function CollaborationDemo() {
  const boardId = "demo-board";
  const itemId = "demo-item";
  
  const { presences, onlineUsers, currentUser, updateCursor } = usePresence(boardId, itemId);
  const { editingUsers, isFieldBeingEdited, getFieldEditor } = useLiveEditing(itemId);
  const { activities } = useActivityStream(boardId);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCursors, setShowCursors] = useState(true);
  const [itemTitle, setItemTitle] = useState("Collaborative Task");
  const [itemDescription, setItemDescription] = useState("This is a shared task that multiple team members can edit simultaneously.");

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      updateCursor(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [updateCursor]);

  const titleEditor = getFieldEditor("title");
  const descriptionEditor = getFieldEditor("description");

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Real-time Collaboration</h1>
            <p className="text-gray-600 dark:text-gray-400">
              See who's online and what they're working on
            </p>
          </div>
        </div>

        {/* Online Indicator */}
        <div className="flex items-center gap-3">
          <PresenceAvatars presences={presences} max={5} size="md" />
          <Badge variant={onlineUsers.length > 0 ? "default" : "secondary"} className="gap-1">
            {onlineUsers.length > 0 ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {onlineUsers.length} online
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
              <p className="text-2xl font-bold">{onlineUsers.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Viewing</p>
              <p className="text-2xl font-bold">
                {Object.values(presences).filter((p) => p.viewingItemId === itemId).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Editing</p>
              <p className="text-2xl font-bold">{Object.keys(editingUsers).length}</p>
            </div>
            <Edit3 className="h-8 w-8 text-orange-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cursors</p>
              <p className="text-2xl font-bold">{showCursors ? "ON" : "OFF"}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCursors(!showCursors)}
            >
              <MousePointer2 className="h-8 w-8 text-purple-400" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Collaborative Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Shared Item Editor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Type in the fields below. In a real app, other users would see your changes in real-time.
            </p>

            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                {titleEditor && <FieldEditingIndicator user={titleEditor} fieldName="title" />}
                <Input
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className={isFieldBeingEdited("title") ? "ring-2 ring-blue-500" : ""}
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                {descriptionEditor && (
                  <FieldEditingIndicator user={descriptionEditor} fieldName="description" />
                )}
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Enter task description..."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isFieldBeingEdited("description") ? "ring-2 ring-blue-500" : ""
                  }`}
                />
              </div>

              {/* Current User */}
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full animate-pulse"
                    style={{ backgroundColor: currentUser.color }}
                  />
                  <div>
                    <p className="text-sm font-medium">You are {currentUser.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your changes are being synced in real-time
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>

        {/* Sidebar - Collaborators */}
        <div className="space-y-4">
          <CollaboratorList
            users={[currentUser, ...onlineUsers]}
            onlineUserIds={onlineUsers.map((u) => u.id)}
          />

          {/* Features */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Collaboration Features</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Live Presence</p>
                  <p className="text-xs">See who's online and viewing the same items</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <MousePointer2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Live Cursors</p>
                  <p className="text-xs">See where collaborators are pointing</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <Edit3 className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Field Locking</p>
                  <p className="text-xs">Visual indicators when fields are being edited</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Activity Stream</p>
                  <p className="text-xs">Real-time feed of all user actions</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Implementation Ready</h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p>✓ WebSocket ready hooks</p>
              <p>✓ Presence state management</p>
              <p>✓ Cursor position tracking</p>
              <p>✓ Field-level edit detection</p>
              <p>✓ Activity logging</p>
              <p>✓ User color assignments</p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Ready to integrate with:
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Pusher</Badge>
                <Badge variant="outline" className="text-xs">Ably</Badge>
                <Badge variant="outline" className="text-xs">Socket.io</Badge>
                <Badge variant="outline" className="text-xs">WebRTC</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Live Cursors (simulated) */}
      {showCursors && Object.values(presences).map((presence) => {
        if (presence.cursor) {
          return (
            <LiveCursor
              key={presence.userId}
              user={presence.user}
              x={presence.cursor.x}
              y={presence.cursor.y}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
