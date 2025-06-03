"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import apiService from "@/lib/services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OkrStatisticsProps {
  teamId: string;
}

interface Statistics {
  totalObjectives: number;
  completedObjectives: number;
  inProgressObjectives: number;
  atRiskObjectives: number;
  totalKeyResults: number;
  completedKeyResults: number;
  averageProgress: number;
  statusCounts: Record<string, number>;
}

export function OkrStatistics({ teamId }: OkrStatisticsProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [teamId]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTeamOkrStatistics(teamId);
      setStatistics(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load OKR statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm">Loading statistics...</div>;
  }

  if (!statistics) {
    return <div className="text-sm text-muted-foreground">No statistics available</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{statistics.averageProgress || 0}%</div>
          <Progress value={Number(statistics.averageProgress) || 0} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-sm font-medium text-right">{statistics.totalObjectives}</div>
            
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-sm font-medium text-right">{statistics.completedObjectives}</div>
            
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-sm font-medium text-right">{statistics.inProgressObjectives}</div>
            
            <div className="text-sm text-muted-foreground">At Risk</div>
            <div className="text-sm font-medium text-right">{statistics.atRiskObjectives}</div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">Completion Rate</div>
              <div className="text-xs font-medium">
                {statistics.totalObjectives > 0 
                  ? Math.round((statistics.completedObjectives / statistics.totalObjectives) * 100) 
                  : 0}%
              </div>
            </div>
            <Progress 
              value={statistics.totalObjectives > 0 
                ? Number((statistics.completedObjectives / statistics.totalObjectives) * 100) || 0
                : 0} 
              className="h-1" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-sm font-medium text-right">{statistics.totalKeyResults}</div>
            
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-sm font-medium text-right">{statistics.completedKeyResults}</div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">Completion Rate</div>
              <div className="text-xs font-medium">
                {statistics.totalKeyResults > 0 
                  ? Math.round((statistics.completedKeyResults / statistics.totalKeyResults) * 100) 
                  : 0}%
              </div>
            </div>
            <Progress 
              value={statistics.totalKeyResults > 0 
                ? Number((statistics.completedKeyResults / statistics.totalKeyResults) * 100) || 0
                : 0} 
              className="h-1" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 