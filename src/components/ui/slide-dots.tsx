import * as React from "react";
import { cn } from "@/lib/utils";

interface SlideDotsProps {
  total: number;
  current: number;
  className?: string;
  dotClassName?: string;
  activeDotClassName?: string;
  onClick?: (index: number) => void;
}

export function SlideDots({
  total,
  current,
  className,
  dotClassName,
  activeDotClassName,
  onClick,
}: SlideDotsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={onClick ? () => onClick(index) : undefined}
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            current === index
              ? cn("bg-indigo-600 dark:bg-indigo-400", activeDotClassName)
              : cn("bg-gray-300 dark:bg-gray-600", dotClassName)
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
} 