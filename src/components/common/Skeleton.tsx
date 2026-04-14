import React from "react";
import { cn } from "../../utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export function Skeleton({ className, count = 1, ...props }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse",
            className,
          )}
          {...props}
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton count={2} />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
