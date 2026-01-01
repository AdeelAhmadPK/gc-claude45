"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Tag, Activity, Paperclip, MoreHorizontal, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CommentsSection } from "./comments-section";
import { FileUploader } from "./file-uploader";
import { format } from "date-fns";

interface Column {
  id: string;
  name: string;
  type: string;
  settings?: Record<string, any>;
}

interface ColumnValue {
  id: string;
  columnId: string;
  value: any;
  column: Column;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  position: number;
  columnValues: ColumnValue[];
  createdAt: string;
  updatedAt: string;
}

interface ItemDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  boardId: string;
  itemId: string;
}

export function ItemDetailDrawer({ isOpen, onClose, workspaceId, boardId, itemId }: ItemDetailDrawerProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "files">("overview");

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItem();
    }
  }, [isOpen, itemId]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
        setName(data.name);
        setDescription(data.description || "");
      }
    } catch (error) {
      console.error("Failed to fetch item:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemName = async () => {
    if (!name.trim() || name === item?.name) {
      setEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItem(updated);
        setEditingName(false);
      }
    } catch (error) {
      console.error("Failed to update item name:", error);
    }
  };

  const updateItemDescription = async () => {
    if (description === item?.description) {
      setEditingDescription(false);
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItem(updated);
        setEditingDescription(false);
      }
    } catch (error) {
      console.error("Failed to update description:", error);
    }
  };

  const deleteItem = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onClose();
        window.location.reload(); // Refresh the board
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const duplicateItem = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${item?.name} (Copy)`,
          description: item?.description,
          groupId: item?.columnValues[0]?.column?.id, // You'll need to pass groupId properly
        }),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to duplicate item:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              {editingName ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={updateItemName}
                  onKeyDown={(e) => e.key === "Enter" && updateItemName()}
                  autoFocus
                  className="text-xl font-semibold"
                />
              ) : (
                <h2
                  className="text-xl font-semibold cursor-pointer hover:text-blue-600"
                  onClick={() => setEditingName(true)}
                >
                  {item?.name || "Loading..."}
                </h2>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={duplicateItem}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={deleteItem}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 px-6 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            className={`pb-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`pb-2 font-medium transition-colors ${
              activeTab === "activity"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            <Activity className="inline h-4 w-4 mr-1" />
            Activity
          </button>
          <button
            className={`pb-2 font-medium transition-colors ${
              activeTab === "files"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("files")}
          >
            <Paperclip className="inline h-4 w-4 mr-1" />
            Files
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Description */}
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
                    {editingDescription ? (
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={updateItemDescription}
                        placeholder="Add a description..."
                        className="min-h-[100px]"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded min-h-[100px]"
                        onClick={() => setEditingDescription(true)}
                      >
                        {description || (
                          <span className="text-gray-400">Click to add description...</span>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Column Values */}
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Properties</h3>
                    <div className="space-y-3">
                      {item?.columnValues?.map((cv) => (
                        <div key={cv.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {cv.column.name}
                          </span>
                          <div className="text-sm">
                            {cv.column.type === "STATUS" && cv.value && (
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: cv.value.color || "#e5e7eb",
                                  color: "#fff",
                                }}
                              >
                                {cv.value.label}
                              </span>
                            )}
                            {cv.column.type === "DATE" && cv.value && (
                              <span className="text-gray-700 dark:text-gray-300">
                                {format(new Date(cv.value), "MMM dd, yyyy")}
                              </span>
                            )}
                            {cv.column.type === "TEXT" && (
                              <span className="text-gray-700 dark:text-gray-300">
                                {cv.value || "-"}
                              </span>
                            )}
                            {cv.column.type === "NUMBER" && (
                              <span className="text-gray-700 dark:text-gray-300">
                                {cv.value || "-"}
                              </span>
                            )}
                            {cv.column.type === "CHECKBOX" && (
                              <input
                                type="checkbox"
                                checked={cv.value || false}
                                readOnly
                                className="h-4 w-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Metadata */}
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {item?.createdAt && format(new Date(item.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last updated</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {item?.updatedAt && format(new Date(item.updatedAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Comments */}
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Updates & Comments</h3>
                    <CommentsSection
                      workspaceId={workspaceId}
                      boardId={boardId}
                      itemId={itemId}
                    />
                  </Card>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Activity log coming soon...</p>
                  {/* TODO: Implement activity log from ActivityLog table */}
                </div>
              )}

              {activeTab === "files" && (
                <div className="space-y-3">
                  <FileUploader
                    workspaceId={workspaceId}
                    boardId={boardId}
                    itemId={itemId}
                  />
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
