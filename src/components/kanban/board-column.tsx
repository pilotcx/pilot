"use client";

import { TaskItem } from "@/components/kanban/task-item";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TaskStatus } from "@/lib/types/models/task";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import React from "react";

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
  });

  const columnStyles = cva(
    "w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center rounded-lg",
    {
      variants: {
        dragging: {
          default: "border-transparent",
          over: "opacity-30",
          overlay: "ring-0",
        },
      },
    }
  );

  const taskList = () => {
    return tasks?.length > 0 ? (
      tasks.map((task) => (
        <TaskItem key={`card-${task._id}-${task.status}`} task={task} />
      ))
    ) : (
      <p className="pl-2 text-sm text-muted-foreground">
        No task in this column
      </p>
    );
  };

  return (
    <div 
      className={columnStyles()} 
      ref={setDroppableRef}
      data-is-droppable-column={true}
      data-column-id={column.id}
      data-column-status={column.status}
    >
      <div className="pt-4 pb-0 px-4 uppercase font-semibold text-left flex items-center text-sm">
        <span className="">{column.title}</span>
        <span className="ml-2 text-gray-500">{tasks?.length || 0}</span>
      </div>
      <ScrollArea className="h-full">
        <CardContent className={`flex flex-grow flex-col gap-2 p-2 min-h-[200px] ${isOver ? 'bg-secondary/20' : ''}`}>
          {taskList()}
        </CardContent>
      </ScrollArea>
    </div>
  );
}

export const BoardContainer = ({ children }: { children: React.ReactNode }) => {
  const containerStyles = cva("w-full min-h-0 h-full lg:justify-center");

  return (
    <div className={containerStyles()}>
      <div className="flex w-full h-full flex-row gap-4 overflow-x-auto p-4">
        {children}
      </div>
    </div>
  );
};
