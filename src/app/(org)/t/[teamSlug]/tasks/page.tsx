"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, ListTodoIcon, CalendarIcon, CheckCircle2Icon, CircleIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import { Task, TaskStatus } from "@/lib/types/models/task";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function TasksPage() {
  const { team } = useTeam();
  const router = useRouter();
  const [getUserTeamTasks, { data: tasksData, loading }] = useApi(api.getUserTeamTasks);
  const [tasks, setTasks] = useState<Task[]>([]);

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
        return <CheckCircle2Icon className="h-4 w-4 text-green-500" />;
      case TaskStatus.InProgress:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case TaskStatus.Pending:
      default:
        return <CircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your team's tasks
          </p>
        </div>
        <Button onClick={handleCreateTask}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-2 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <ListTodoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task to start tracking work
            </p>
            <Button onClick={handleCreateTask}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task._id as string}
              className="p-4 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => handleTaskClick(task._id as string)}
            >
              <CardContent className="p-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status as TaskStatus)}
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.project && typeof task.project !== 'string' && (
                      <Badge variant="secondary" className="text-xs">
                        {task.project.code}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {new Date(task.dueDate as string).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
