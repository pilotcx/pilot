"use client";
import { Task, TaskStatus } from "@/lib/types/models/task";
import { cn, getStatusLabel } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { Calendar, CheckCircle, Clock, Plane, User } from "lucide-react";

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

interface TaskItemProps {
  task: Task;
  isOverlay?: boolean;
}

export const TaskItem = ({ task, isOverlay }: TaskItemProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = !isOverlay
    ? useSortable({
        id: task._id as string,
        data: {
          type: "Task",
          task,
        } satisfies TaskDragData,
        attributes: {
          roleDescription: "Task",
        },
      })
    : {
        setNodeRef: undefined,
        attributes: {},
        listeners: {},
        transform: null,
        transition: undefined as unknown as string,
        isDragging: false,
      };

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  // Get assignee name if available
  const assigneeName =
    task.assignee &&
    typeof task.assignee === "object" &&
    "displayName" in task.assignee
      ? task.assignee.displayName
      : undefined;

  // Format date
  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.Completed:
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case TaskStatus.InProgress:
        return <Plane className="h-3.5 w-3.5 text-blue-500" />;
      case TaskStatus.Pending:
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <div
        {...attributes}
        {...listeners}
        style={style}
        className={cn(
          "bg-background border border-gray-200 rounded-md shadow-sm transition-all p-2.5 cursor-grab active:cursor-grabbing",
          variants({
            dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
          })
        )}
      >
        {/* Task title */}
        <h3 className="font-medium text-sm text-gray-800 mb-1.5 line-clamp-2">
          {task.title}
        </h3>

        {/* Task metadata footer */}
        <div className="flex items-center justify-between gap-1 text-xs text-gray-500">
          {/* Status indicator */}
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span>{getStatusLabel(task.status)}</span>
          </div>

          {/* Due date if available */}
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Assignee if available */}
          {assigneeName && (
            <div className="flex items-center gap-1 ml-auto">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate max-w-[80px]">{assigneeName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
