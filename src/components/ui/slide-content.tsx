import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SlideContentProps {
  title: string;
  description: string;
  image?: string;
  className?: string;
}

export function SlideContent({
  title,
  description,
  image,
  className,
}: SlideContentProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {image && (
        <div className="w-full flex justify-center mb-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
        {title}
      </h1>

      <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-2xl">
        {description}
      </p>
    </div>
  );
} 