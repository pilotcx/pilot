"use client";

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
} 