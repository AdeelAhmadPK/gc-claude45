"use client";

import { useState } from "react";
import { RichTextEditor } from "../editor/rich-text-editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface Update {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
  reactions?: Reaction[];
  replies?: Reply[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
}

interface UpdatesTabProps {
  itemId: string;
  workspaceId: string;
  boardId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  teamMembers?: { id: string; name: string; image?: string }[];
}

export function UpdatesTab({
  itemId,
  workspaceId,
  boardId,
  currentUserId,
  currentUserName,
  currentUserImage,
  teamMembers = [],
}: UpdatesTabProps) {
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: "1",
      userId: "user1",
      userName: "Sarah Chen",
      userImage: "https://avatar.vercel.sh/sarah",
      content: "<p>Just finished the initial design mockups. <strong>@John</strong> can you review?</p>",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      attachments: [
        {
          id: "att1",
          name: "design-mockup-v1.fig",
          url: "#",
          type: "application/figma",
          size: 2500000,
        },
      ],
      reactions: [
        { id: "r1", emoji: "👍", userId: "user2", userName: "John Doe" },
        { id: "r2", emoji: "🎉", userId: "user3", userName: "Alice Smith" },
      ],
      replies: [
        {
          id: "rep1",
          userId: "user2",
          userName: "John Doe",
          userImage: "https://avatar.vercel.sh/john",
          content: "<p>Looks great! Minor feedback on the color scheme.</p>",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    },
  ]);

  const [newUpdate, setNewUpdate] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handlePostUpdate = async () => {
    if (!newUpdate.trim() && uploadedFiles.length === 0) return;

    // TODO: API call to post update
    const mockUpdate: Update = {
      id: Math.random().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userImage: currentUserImage,
      content: newUpdate,
      createdAt: new Date(),
      attachments: uploadedFiles.map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      })),
      reactions: [],
      replies: [],
    };

    setUpdates([mockUpdate, ...updates]);
    setNewUpdate("");
    setUploadedFiles([]);
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleAddReaction = (updateId: string, emoji: string) => {
    setUpdates(
      updates.map((update) => {
        if (update.id === updateId) {
          const existingReaction = update.reactions?.find(
            (r) => r.emoji === emoji && r.userId === currentUserId
          );

          if (existingReaction) {
            // Remove reaction
            return {
              ...update,
              reactions: update.reactions?.filter(
                (r) => r.id !== existingReaction.id
              ),
            };
          } else {
            // Add reaction
            return {
              ...update,
              reactions: [
                ...(update.reactions || []),
                {
                  id: Math.random().toString(),
                  emoji,
                  userId: currentUserId,
                  userName: currentUserName,
                },
              ],
            };
          }
        }
        return update;
      })
    );
  };

  const handlePostReply = async (updateId: string) => {
    if (!replyContent.trim()) return;

    const mockReply: Reply = {
      id: Math.random().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userImage: currentUserImage,
      content: replyContent,
      createdAt: new Date(),
    };

    setUpdates(
      updates.map((update) => {
        if (update.id === updateId) {
          return {
            ...update,
            replies: [...(update.replies || []), mockReply],
          };
        }
        return update;
      })
    );

    setReplyContent("");
    setReplyingTo(null);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* New Update Editor */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b">
        <RichTextEditor
          content={newUpdate}
          onChange={setNewUpdate}
          placeholder="Write an update... Use @ to mention someone"
          onSubmit={handlePostUpdate}
          onFileUpload={handleFileUpload}
          mentions={teamMembers}
        />

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Attached Files ({uploadedFiles.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No updates yet</h3>
            <p className="text-gray-500 mt-1">Be the first to post an update!</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="group">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={update.userImage} />
                  <AvatarFallback>
                    {update.userName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {update.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(update.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {update.userId === currentUserId && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: update.content }}
                    />

                    {/* Attachments */}
                    {update.attachments && update.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {update.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 p-2 border rounded bg-white"
                          >
                            {getFileIcon(attachment.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-2 mt-2">
                    {update.reactions && update.reactions.length > 0 && (
                      <div className="flex items-center gap-1">
                        {Array.from(
                          new Set(update.reactions.map((r) => r.emoji))
                        ).map((emoji) => {
                          const count = update.reactions!.filter(
                            (r) => r.emoji === emoji
                          ).length;
                          const hasReacted = update.reactions!.some(
                            (r) => r.emoji === emoji && r.userId === currentUserId
                          );

                          return (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(update.id, emoji)}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs flex items-center gap-1 border",
                                hasReacted
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-white hover:bg-gray-50"
                              )}
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-600">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={() => handleAddReaction(update.id, "👍")}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Heart className="h-3 w-3" />
                      React
                    </button>

                    <button
                      onClick={() => setReplyingTo(update.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {update.replies && update.replies.length > 0 && (
                    <div className="mt-3 space-y-3 ml-3 border-l-2 border-gray-200 pl-3">
                      {update.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.userImage} />
                            <AvatarFallback>
                              {reply.userName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-white border rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-xs text-gray-900">
                                  {reply.userName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDistanceToNow(reply.createdAt, {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                              <div
                                className="prose prose-xs max-w-none"
                                dangerouslySetInnerHTML={{ __html: reply.content }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === update.id && (
                    <div className="mt-3 ml-3 border-l-2 border-blue-200 pl-3">
                      <RichTextEditor
                        content={replyContent}
                        onChange={setReplyContent}
                        placeholder="Write a reply..."
                        onSubmit={() => handlePostReply(update.id)}
                        className="border-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
