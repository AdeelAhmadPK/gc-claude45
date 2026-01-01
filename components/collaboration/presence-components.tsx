"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Presence, User } from "@/hooks/use-presence";
import { Users, Eye, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresenceAvatarsProps {
  presences: Record<string, Presence>;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function PresenceAvatars({ presences, max = 5, size = "md" }: PresenceAvatarsProps) {
  const users = Object.values(presences).map((p) => p.user);
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const borderSizes = {
    sm: "ring-1",
    md: "ring-2",
    lg: "ring-2",
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Users className="h-4 w-4 text-gray-500 mr-1" />
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <Avatar
            key={user.id}
            className={cn(
              sizeClasses[size],
              borderSizes[size],
              "ring-white dark:ring-gray-900"
            )}
            title={user.name}
          >
            <AvatarImage src={user.image} />
            <AvatarFallback style={{ backgroundColor: user.color }}>
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              sizeClasses[size],
              borderSizes[size],
              "flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 ring-white dark:ring-gray-900 font-medium"
            )}
            title={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}

interface LiveCursorProps {
  user: User;
  x: number;
  y: number;
}

export function LiveCursor({ user, x, y }: LiveCursorProps) {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L16.8334 7.75862L12.2247 18.9383L10.3333 14.3333L5.65376 12.3673Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="mt-1 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}

interface FieldEditingIndicatorProps {
  user: User;
  fieldName: string;
}

export function FieldEditingIndicator({ user, fieldName }: FieldEditingIndicatorProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Edit3 className="h-3 w-3 animate-pulse" style={{ color: user.color }} />
      <span style={{ color: user.color }}>
        {user.name} is editing {fieldName}
      </span>
    </div>
  );
}

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    user: User;
    action: string;
    target?: string;
    timestamp: number;
  }>;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActionText = (action: string, target?: string) => {
    switch (action) {
      case "viewed":
        return target ? `viewed ${target}` : "viewed this board";
      case "edited":
        return target ? `edited ${target}` : "made an edit";
      case "commented":
        return target ? `commented on ${target}` : "added a comment";
      case "joined":
        return "joined the board";
      case "left":
        return "left the board";
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "viewed":
        return <Eye className="h-3 w-3" />;
      case "edited":
        return <Edit3 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No recent activity</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Live Activity
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activity.user.image} />
              <AvatarFallback style={{ backgroundColor: activity.user.color }}>
                {activity.user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-gray-100">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {getActionText(activity.action, activity.target)}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {getActionIcon(activity.action)}
          </div>
        ))}
      </div>
    </Card>
  );
}

interface CollaboratorListProps {
  users: User[];
  onlineUserIds: string[];
}

export function CollaboratorList({ users, onlineUserIds }: CollaboratorListProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Collaborators ({users.length})
      </h3>
      <div className="space-y-2">
        {users.map((user) => {
          const isOnline = onlineUserIds.includes(user.id);
          return (
            <div key={user.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              {isOnline && (
                <Badge variant="secondary" className="text-xs">
                  Online
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
