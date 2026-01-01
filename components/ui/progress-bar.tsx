import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const colorClasses = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-orange-500",
  danger: "bg-red-500",
};

export function ProgressBar({
  value,
  max = 100,
  size = "sm",
  variant = "default",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Auto-determine variant based on percentage
  const autoVariant = variant === "default" 
    ? percentage >= 100 
      ? "success" 
      : percentage >= 75 
      ? "default" 
      : percentage >= 50 
      ? "warning" 
      : "danger"
    : variant;

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full transition-all duration-300 rounded-full", colorClasses[autoVariant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export function InlineProgress({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = percentage >= 100 
    ? "text-green-600 dark:text-green-400 bg-green-500/10" 
    : percentage >= 50 
    ? "text-blue-600 dark:text-blue-400 bg-blue-500/10" 
    : "text-gray-600 dark:text-gray-400 bg-gray-500/10";

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            percentage >= 100 ? "bg-green-500" : percentage >= 50 ? "bg-blue-500" : "bg-gray-400"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", color)}>
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
