"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <Skeleton className="h-4 w-4 mr-3" />
      <Skeleton className="h-5 w-48 mr-4" />
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-24 mr-4" />
      ))}
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Group skeletons */}
      {[1, 2].map((group) => (
        <div key={group} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Group header */}
          <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-32 mr-4" />
            <Skeleton className="h-5 w-16" />
          </div>
          
          {/* Column headers */}
          <div className="flex items-center px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 border-b">
            <div className="w-12" />
            <Skeleton className="h-4 w-16 mr-32" />
            {[1, 2, 3, 4].map((col) => (
              <Skeleton key={col} className="h-4 w-16 mr-20" />
            ))}
          </div>

          {/* Item rows */}
          {[1, 2, 3].map((row) => (
            <TableRowSkeleton key={row} columns={4} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-4 px-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
              <CardSkeleton key={card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
