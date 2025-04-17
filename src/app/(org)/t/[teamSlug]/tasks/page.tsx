"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { Task, TaskStatus } from "@/lib/types/models/task";
import { cn, getFormattedDate } from "@/lib/utils";
import dayjs from "dayjs";
import {
  CalendarIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  ListTodoIcon,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TasksPage() {
  const { team } = useTeam();
  const router = useRouter();
  const [getUserTeamTasks, { data: tasksData, loading }] = useApi(
    api.getUserTeamTasks
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        await getUserTeamTasks(team._id as string);
      } catch (error: any) {
        toast.error(error.message || "Failed to load tasks");
        console.error("Error fetching tasks:", error);
      }
    };

    if (team._id) {
      fetchTasks();
    }
  }, [team._id]);

  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
    }
  }, [tasksData]);

  const handleCreateTask = () => {
    router.push(`/t/${team.slug}/tasks/new`);
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/t/${team.slug}/tasks/${taskId}`);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Completed:
        return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />;
      case TaskStatus.InProgress:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case TaskStatus.Pending:
      default:
        return <CircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Completed:
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case TaskStatus.InProgress:
        return "text-blue-600 bg-blue-50 border-blue-200";
      case TaskStatus.Pending:
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return task.status === TaskStatus.Pending;
    if (activeTab === "in-progress")
      return task.status === TaskStatus.InProgress;
    if (activeTab === "completed") return task.status === TaskStatus.Completed;
    return true;
  });

 

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your team's work
          </p>
        </div>
        <Button onClick={handleCreateTask} variant="default">
          <PlusIcon className="h-4 w-4 mr-1.5" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="all" className="px-4">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-4">
            Pending
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="px-4">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="px-4">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-background border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 border rounded-lg bg-gray-50/50 dark:bg-gray-900/20">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <ListTodoIcon className="h-8 w-8 text-primary/80" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {activeTab === "all"
                  ? "Start tracking your work by creating your first task"
                  : `No ${activeTab.replace("-", " ")} tasks available`}
              </p>
              <Button onClick={handleCreateTask} variant="default">
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card
                  key={task._id as string}
                  className="overflow-hidden border hover:border-gray-300 transition-colors cursor-pointer bg-background relative"
                  onClick={() => handleTaskClick(task._id as string)}
                >
                  <CardContent className="p-4 pl-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status as TaskStatus)}
                        <span className="font-medium">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-3 text-sm ml-7 sm:ml-0">
                        {task.project && typeof task.project !== "string" && (
                          <Badge variant="secondary" className="text-xs">
                            {task.project.code}
                          </Badge>
                        )}

                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {getFormattedDate(task.dueDate as string)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-1 ml-7">
                        {task.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
