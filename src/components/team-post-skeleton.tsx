"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TeamPostSkeleton() {
  return (
    <div className="bg-card rounded-lg border shadow-sm flex">
      <div className="bg-muted/30 rounded-l-lg w-14 flex-shrink-0 flex">
        <div className="p-2 flex flex-col items-center w-full">
          <Skeleton className="h-8 w-8 rounded-full mb-2" />
          <Skeleton className="h-8 w-8 rounded-full mb-2" />
          <Skeleton className="h-8 w-8 rounded-full mb-2" />
        </div>
      </div>
      <div className="p-4 flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
