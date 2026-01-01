import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const borderClasses = {
  xs: "border",
  sm: "border-2",
  md: "border-2",
  lg: "border-2",
};

export function AvatarGroup({ users, max = 3, size = "sm", className }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <TooltipProvider>
      <div className={cn("flex -space-x-2", className)}>
        {displayUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  borderClasses[size],
                  "border-white dark:border-gray-800",
                  "hover:z-10 transition-all cursor-pointer"
                )}
              >
                <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{user.name || user.email}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  sizeClasses[size],
                  borderClasses[size],
                  "rounded-full bg-gray-200 dark:bg-gray-700",
                  "flex items-center justify-center",
                  "border-white dark:border-gray-800",
                  "text-gray-600 dark:text-gray-300 font-medium",
                  "hover:z-10 transition-all cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {users.slice(max).map((user) => (
                  <p key={user.id} className="text-sm">
                    {user.name || user.email}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
