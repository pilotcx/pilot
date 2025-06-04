"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import apiService from "@/lib/services/api";
import { Objective, ObjectiveStatus } from "@/lib/types/models/okr";
import { ArrowRight, CalendarIcon, ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function OKRDashboardPage() {
  const { team } = useTeam();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    atRisk: 0,
  });

  useEffect(() => {
    loadObjectives();
  }, [team._id]);

  const loadObjectives = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTeamObjectives(team._id as string);
      setObjectives(response.data);

      // Calculate stats
      const total = response.data.length;
      const completed = response.data.filter(
        (obj) => obj.status === ObjectiveStatus.COMPLETED
      ).length;
      const inProgress = response.data.filter(
        (obj) => obj.status === ObjectiveStatus.IN_PROGRESS
      ).length;
      const atRisk = response.data.filter(
        (obj) => obj.status === ObjectiveStatus.AT_RISK
      ).length;

      setStats({ total, completed, inProgress, atRisk });
    } catch (error: any) {
      toast.error(error.message || "Failed to load objectives");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    if (objectives.length === 0) return 0;
    const totalProgress = objectives.reduce(
      (sum, obj) => sum + obj.progress,
      0
    );
    return Math.round(totalProgress / objectives.length);
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    NOT_STARTED: "bg-gray-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    AT_RISK: "bg-yellow-500",
    FAILED: "bg-red-500",
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Dashboard</h1>
        <Button asChild>
          <Link href={`/t/${team.slug}/okr/objectives`}>
            View All Objectives
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Objectives
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRisk}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Objectives</h2>
        <div className="space-y-2">
          {objectives.slice(0, 3).map((objective) => (
            <div key={objective._id} className="border rounded-md overflow-hidden">
              <div className="flex items-center justify-between py-3 px-4 bg-muted/20">
                <div className="flex items-center gap-2 flex-1">
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <h3 className="font-medium">{objective.title}</h3>
                  <Badge
                    variant="secondary"
                    className={`${statusColors[objective.status]} text-white text-xs hover:bg-unset ml-1`}
                  >
                    {objective.status.replace("_", " ")}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-xs text-muted-foreground flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {dayjs(objective.dueDate).format("DD/MM/YYYY")}
                  </div>
                  <div className="flex items-center gap-1 w-32">
                    <Progress value={objective.progress} className="w-20 h-2" />
                    <span className="text-xs">{objective.progress}%</span>
                  </div>
                  <Link 
                    href={`/t/${team.slug}/okr/objectives`} 
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {objectives.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No objectives found. Create your first objective to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
