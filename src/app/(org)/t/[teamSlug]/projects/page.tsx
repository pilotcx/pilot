"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FolderIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import { Project } from "@/lib/types/models/project";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { team } = useTeam();
  const router = useRouter();
  const [getTeamProjects, { data: projectsData, loading }] = useApi(api.getTeamProjects);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await getTeamProjects(team._id as string);
      } catch (error: any) {
        toast.error(error.message || "Failed to load projects");
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [team._id, getTeamProjects]);

  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData);
    }
  }, [projectsData]);

  const handleCreateProject = () => {
    router.push(`/t/${team.slug}/projects/new`);
  };

  const handleProjectClick = (projectCode: string) => {
    router.push(`/t/${team.slug}/projects/${projectCode}`);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your team's projects and track their progress
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start organizing your team's work
            </p>
            <Button onClick={handleCreateProject}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project._id as string}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProjectClick(project.code)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-card">
                    <span className="font-semibold text-sm">{project.code}</span>
                  </div>
                  <CardTitle>{project.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Additional project info could go here */}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 p-3">
                <div className="flex w-full justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(project.createdAt as string).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View <ArrowRightIcon className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
