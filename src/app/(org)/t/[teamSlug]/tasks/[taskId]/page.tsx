"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { Task, TaskPriority, TaskStatus } from "@/lib/types/models/task";
import { User } from "@/lib/types/models/user";
import { cn, getFormattedDate } from "@/lib/utils";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  Loader2Icon,
  MessageSquareIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const { team } = useTeam();
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [getTask, { data: taskData, loading }] = useApi(api.getTask);
  const [updateTaskStatus, { loading: updatingStatus }] = useApi(
    api.updateTask
  );
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        await getTask(team._id as string, taskId);
      } catch (error: any) {
        toast.error(error.message || "Failed to load task details");
        console.error("Error fetching task:", error);
      }
    };

    if (team._id && taskId) {
      fetchTask();
    }
  }, [team._id, taskId, getTask]);

  useEffect(() => {
    if (taskData) {
      setTask(taskData);
    }
  }, [taskData]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(team._id as string, taskId, { status: newStatus });
      setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success("Task status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
      console.error("Error updating status:", error);
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Urgent:
        return "Urgent";
      case TaskPriority.High:
        return "High";
      case TaskPriority.Medium:
        return "Medium";
      case TaskPriority.Low:
        return "Low";
      default:
        return "Medium";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Urgent:
        return "text-rose-700 bg-rose-50";
      case TaskPriority.High:
        return "text-amber-700 bg-amber-50";
      case TaskPriority.Medium:
        return "text-blue-700 bg-blue-50";
      case TaskPriority.Low:
        return "text-green-700 bg-green-50";
      default:
        return "text-blue-700 bg-blue-50";
    }
  };

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Completed:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case TaskStatus.InProgress:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case TaskStatus.Pending:
        return "bg-gray-50 text-gray-700 border-gray-200";
      case TaskStatus.Overdue:
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-6">
        <div className="mb-6 flex items-center">
          <Skeleton className="h-4 w-24 mr-2" />
        </div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-40 mb-8" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full mb-2" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container max-w-3xl py-6">
        <div className="mb-6">
          <Link
            href={`/t/${team.slug}/tasks`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Tasks
          </Link>
          <h1 className="text-2xl font-semibold">Task Not Found</h1>
          <p className="text-muted-foreground mt-1">
            The task you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const assignee = typeof task.assignee !== "string" ? task.assignee : null;
  const project = typeof task.project !== "string" ? task.project : null;

  return (
    <div className="container max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/t/${team.slug}/tasks`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Tasks
        </Link>
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <div className="flex gap-2 items-center mt-2">
          {project && (
            <Badge variant="outline" className="text-xs">
              {project.code} - {project.name}
            </Badge>
          )}
          <Badge
            className={cn(
              "text-xs",
              getStatusBadgeClass(task.status as TaskStatus)
            )}
          >
            {task.status === TaskStatus.InProgress
              ? "In Progress"
              : task.status}
          </Badge>
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardContent className="p-6">
          {/* Description Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <div className="text-foreground min-h-[60px]">
              {task.description ? (
                <p className="whitespace-pre-line">{task.description}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {/* Due Date */}
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Due Date
                </h4>
                <p className="text-foreground">
                  {getFormattedDate(task.dueDate as string)}
                </p>
              </div>
            </div>

            {/* Assignee */}
            <div className="flex items-start gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Assignee
                </h4>
                <p className="text-foreground">
                  {assignee
                    ? (assignee as unknown as User).fullName
                    : "Unassigned"}
                </p>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-start gap-2">
              <FlagIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Priority
                </h4>
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-1",
                    getPriorityColor(task.priority as TaskPriority)
                  )}
                >
                  {getPriorityLabel(task.priority as TaskPriority)}
                </Badge>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-2">
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Status
                </h4>
                <div className="text-foreground">
                  {task.status === TaskStatus.Completed
                    ? "Completed"
                    : task.status === TaskStatus.InProgress
                    ? "In Progress"
                    : task.status === TaskStatus.Pending
                    ? "To Do"
                    : "Overdue"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        {task.status !== TaskStatus.Completed && (
          <Button
            variant="outline"
            onClick={() => handleStatusChange(TaskStatus.InProgress)}
            disabled={updatingStatus || task.status === TaskStatus.InProgress}
          >
            {updatingStatus && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!updatingStatus && <ClockIcon className="mr-2 h-4 w-4" />}
            Mark In Progress
          </Button>
        )}

        {task.status !== TaskStatus.Completed && (
          <Button
            onClick={() => handleStatusChange(TaskStatus.Completed)}
            disabled={updatingStatus}
          >
            {updatingStatus && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!updatingStatus && <CheckIcon className="mr-2 h-4 w-4" />}
            Mark Complete
          </Button>
        )}

        {task.status === TaskStatus.Completed && (
          <Button
            variant="outline"
            onClick={() => handleStatusChange(TaskStatus.Pending)}
            disabled={updatingStatus}
          >
            {updatingStatus && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!updatingStatus && <ArrowLeftIcon className="mr-2 h-4 w-4" />}
            Reopen Task
          </Button>
        )}
      </div>
    </div>
  );
}
