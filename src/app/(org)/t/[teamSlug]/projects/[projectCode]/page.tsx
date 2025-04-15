"use client";

import {useTeam} from "@/components/providers/team-provider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  EditIcon,
  ListTodoIcon,
  PlusIcon
} from "lucide-react";
import {use, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import {Project} from "@/lib/types/models/project";
import {Skeleton} from "@/components/ui/skeleton";
import Link from "next/link";
import {Task, TaskStatus} from "@/lib/types/models/task";
import {Badge} from "@/components/ui/badge";

export default function ProjectDetailPage({params: rawParams}: { params: Promise<{ teamSlug: string, projectCode: string }> }) {
  const params = use(rawParams);
  const {team} = useTeam();
  const router = useRouter();
  const [getProjectByCode, {data: projectData, loading: loadingProject}] = useApi(api.getProjectByCode);
  const [getProjectTasks, {data: tasksData, loading: loadingTasks}] = useApi(api.getProjectTasks);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        await getProjectByCode(team._id as string, params.projectCode);
      } catch (error: any) {
        toast.error(error.message || "Failed to load project");
        console.error("Error fetching project:", error);
      }
    };

    if (team._id) {
      fetchProject();
    }
  }, [params.projectCode, team._id, getProjectByCode]);

  useEffect(() => {
    if (projectData) {
      setProject(projectData);

      // Fetch tasks for this project
      const fetchTasks = async () => {
        try {
          await getProjectTasks(team._id as string, projectData._id as string);
        } catch (error: any) {
          toast.error(error.message || "Failed to load tasks");
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }
  }, [projectData, team._id, getProjectTasks]);

  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
    }
  }, [tasksData]);

  const handleCreateTask = () => {
    if (project) {
      router.push(`/t/${team.slug}/tasks/new?project=${project._id}`);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Completed:
        return <CheckCircle2Icon className="h-4 w-4 text-green-500"/>;
      case TaskStatus.InProgress:
        return <ClockIcon className="h-4 w-4 text-blue-500"/>;
      case TaskStatus.Pending:
      default:
        return <CircleIcon className="h-4 w-4 text-gray-500"/>;
    }
  };

  if (loadingProject) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Link
            href={`/t/${team.slug}/projects`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4"/>
            Back to Projects
          </Link>
          <Skeleton className="h-8 w-1/3 mb-2"/>
          <Skeleton className="h-4 w-1/2"/>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2"/>
            <Skeleton className="h-4 w-3/4"/>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2"/>
            <Skeleton className="h-4 w-full mb-2"/>
            <Skeleton className="h-4 w-2/3"/>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have
            access to it.</p>
          <Button asChild>
            <Link href={`/t/${team.slug}/projects`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4"/>
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          href={`/t/${team.slug}/projects`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4"/>
          Back to Projects
        </Link>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-card">
              <span className="font-semibold">{project.code}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          </div>
          <Button variant="outline" size="sm">
            <EditIcon className="mr-2 h-4 w-4"/>
            Edit Project
          </Button>
        </div>
        <p className="text-muted-foreground mt-2">
          {project.description || "No description provided"}
        </p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <Button onClick={handleCreateTask}>
              <PlusIcon className="mr-2 h-4 w-4"/>
              New Task
            </Button>
          </div>

          {loadingTasks ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3"/>
                    <Skeleton className="h-5 w-20"/>
                  </div>
                </Card>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <Card className="border-dashed border-2 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <ListTodoIcon className="h-12 w-12 text-muted-foreground mb-4"/>
                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first task to start tracking work in this project
                </p>
                <Button onClick={handleCreateTask}>
                  <PlusIcon className="mr-2 h-4 w-4"/>
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
                  onClick={() => router.push(`/t/${team.slug}/tasks/${task._id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status as TaskStatus)}
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3"/>
                        {new Date(task.dueDate as string).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Project Members</CardTitle>
              <CardDescription>
                Manage who has access to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Project members functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Manage project settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Project settings functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
