import { ReactNode } from "react";

export default function TaskDetailLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1">{children}</div>;
} 