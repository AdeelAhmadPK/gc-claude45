"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Heart, ThumbsUp, Smile, Reply, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Reaction {
  id: string;
  emoji: string;
  user: User;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  replies?: Comment[];
  reactions?: Reaction[];
}

interface CommentsSectionProps {
  itemId: string;
  boardId: string;
  workspaceId: string;
}

export function CommentsSection({ itemId, boardId, workspaceId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
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
        fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const addReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: replyText, parentId }),
        }
      );

      if (response.ok) {
        setReplyText("");
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    try {
      await fetch(
        `/api/workspaces/${workspaceId}/boards/${boardId}/items/${itemId}/comments/${commentId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        }
      );
      fetchComments();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const groupedReactions = comment.reactions?.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.user);
      return acc;
    }, {} as Record<string, User[]>) || {};

    return (
      <Card className={`p-4 ${isReply ? "ml-12 mt-2" : "mt-3"}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
          </div>

          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-semibold text-sm">{comment.user.name || comment.user.email}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {/* Comment Text */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {comment.text}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setReplyTo(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addReaction(comment.id, "👍")}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Like
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addReaction(comment.id, "❤️")}
              >
                <Heart className="h-3 w-3 mr-1" />
                Love
              </Button>
            </div>

            {/* Reactions */}
            {Object.keys(groupedReactions).length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {Object.entries(groupedReactions).map(([emoji, users]) => (
                  <div
                    key={emoji}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs"
                    title={users.map(u => u.name || u.email).join(", ")}
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-600 dark:text-gray-400">{users.length}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyTo === comment.id && (
              <div className="mt-3 flex items-center gap-2">
                <Input
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addReply(comment.id);
                    }
                  }}
                  className="text-sm"
                />
                <Button size="sm" onClick={() => addReply(comment.id)}>
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4">Updates & Comments</h3>

      {/* New Comment Input */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
          U
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Write an update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addComment();
              }
            }}
          />
          <Button onClick={addComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No updates yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
