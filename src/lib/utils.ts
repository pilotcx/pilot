import { ColumnDragData } from "@/components/kanban/board-column";
import { TaskDragData } from "@/components/kanban/task-item";
import { Active, DataRef, Over } from "@dnd-kit/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskStatus } from "./types/models/task";
import { OrganizationSize } from "./validations/organization";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatSizeLabel = (size: string): string => {
  switch (size) {
    case OrganizationSize.XSmall:
      return "1-10 employees";
    case OrganizationSize.Small:
      return "11-50 employees";
    case OrganizationSize.Medium:
      return "51-200 employees";
    case OrganizationSize.Large:
      return "201-1000 employees";
    case OrganizationSize.XLarge:
      return "1000+ employees";
    default:
      return size;
  }
};

export const formatRoleLabel = (role: string): string => {
  return role.replace("_", " ");
};

type DraggableData = ColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

export const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Completed:
      return "Completed";
    case TaskStatus.InProgress:
      return "In Progress";
    case TaskStatus.Pending:
      return "Todo";
    case TaskStatus.Late:
      return "Late";
    default:
      return "Todo";
  }
};

export const getFormattedDate = (dateString: string) => {
  try {
    return dayjs(dateString).format("DD/MM/YYYY");
  } catch (error) {
    return "Invalid date";
  }
};
