"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Paperclip, Send, Smile, Image as ImageIcon, Trash2, Download, Clock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

interface Update {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Activity {
  id: string;
  type: "status_change" | "assignment" | "comment" | "file_upload" | "due_date_change" | "priority_change" | "created";
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  metadata?: any;
}

interface ItemDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  boardId: string;
  workspaceId: string;
}

export function ItemDetailPanel({ isOpen, onClose, itemId, boardId, workspaceId }: ItemDetailPanelProps) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateContent, setUpdateContent] = useState("");
  const [updates, setUpdates] = useState<Update[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails();
      fetchUpdates();
      fetchFiles();
      fetchActivities();
    }
  }, [isOpen, itemId]);

  const fetchItemDetails = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      }
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/updates`);
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/activity`);
      if (response.ok) {
        const data = await response.json();
        // Format the activity descriptions properly
        const formattedActivities = data.map((activity: any) => ({
          ...activity,
          description: formatActivityDescription(activity),
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  const formatActivityDescription = (activity: any) => {
    const metadata = typeof activity.metadata === 'string' 
      ? JSON.parse(activity.metadata) 
      : activity.metadata;
    
    switch (activity.type) {
      case "status_change":
        return `Changed status to ${metadata?.value || 'Unknown'}`;
      case "assignment":
        return `Assigned to ${metadata?.userName || 'someone'}`;
      case "comment":
        return `Added a comment`;
      case "file_upload":
        return `Uploaded file: ${metadata?.fileName || 'file'}`;
      case "date_change":
        return `Changed due date`;
      case "priority_change":
        return `Changed priority to ${metadata?.value || 'Unknown'}`;
      case "created":
        return `Created this item`;
      default:
        return activity.description || `Updated ${activity.type}`;
    }
  };

  const handleSubmitUpdate = async () => {
    if (!updateContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updateContent }),
      });

      if (response.ok) {
        setUpdateContent("");
        await fetchUpdates();
        await fetchActivities();
      }
    } catch (error) {
      console.error("Failed to submit update:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchFiles();
        await fetchActivities();
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setUploading(false);
    }
  }, [itemId, boardId, workspaceId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/files/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchFiles();
        await fetchActivities();
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "status_change":
        return "📊";
      case "assignment":
        return "👤";
      case "comment":
        return "💬";
      case "file_upload":
        return "📎";
      case "due_date_change":
        return "📅";
      case "priority_change":
        return "⚠️";
      case "created":
        return "✨";
      default:
        return "•";
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

      {/* Panel */}
      <div className={cn(
        "fixed right-0 top-0 bottom-0 w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <input
                type="text"
                value={item?.name || ""}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                className="text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0 w-full"
                placeholder="Item name..."
              />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <Tabs defaultValue="updates" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* Updates Tab */}
            <TabsContent value="updates" className="flex-1 flex flex-col mt-0 px-6">
              <ScrollArea className="flex-1 py-4">
                {updates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Send className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      Be the first to add an update! Share progress, ask questions, or keep your team informed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update.id} className="flex gap-3 group">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={update.user.image || undefined} />
                          <AvatarFallback>
                            {update.user.name?.[0] || update.user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {update.user.name || update.user.email}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{update.content}</p>
                          </div>
                          {update.reactions && update.reactions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {update.reactions.map((reaction, idx) => (
                                <button
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span>{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Update Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
                <Textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder="Write an update..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSubmitUpdate();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleSubmitUpdate} disabled={!updateContent.trim() || submitting}>
                    {submitting ? "Posting..." : "Update"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="flex-1 flex flex-col mt-0 px-6">
              <ScrollArea className="flex-1 py-4">
                {/* Upload Area */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center mb-6 cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary"
                  )}
                >
                  <input {...getInputProps()} />
                  <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium mb-1">
                    {isDragActive ? "Drop files here..." : "Drag & drop files here"}
                  </p>
                  <p className="text-xs text-gray-500">or click to browse</p>
                  {uploading && (
                    <p className="text-sm text-primary mt-2">Uploading...</p>
                  )}
                </div>

                {/* Files List */}
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Paperclip className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No files yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      Upload files to share documents, images, and other resources with your team.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center">
                            <Paperclip className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-sm font-medium truncate mb-1">{file.name}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={file.url} download={file.name}>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="flex-1 mt-0 px-6">
              <ScrollArea className="h-full py-4">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      Activity history will appear here as changes are made to this item.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity, idx) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={activity.user.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {idx < activities.length - 1 && (
                            <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                            <span className="text-sm font-medium">
                              {activity.user.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
