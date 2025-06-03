import { NextRequest } from "next/server";
import { dbService } from "@/lib/db/service";
import { withApi } from "@/lib/utils/withApi";

type Params = {
  teamId: string;
};

// GET /api/teams/[teamId]/okr/statistics
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { teamId } = params as Params;

  // Get all objectives for the team
  const objectives = await dbService.objective.find({ team: teamId });
  
  // Calculate objective statistics
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.status === "COMPLETED").length;
  const inProgressObjectives = objectives.filter(obj => obj.status === "IN_PROGRESS").length;
  const atRiskObjectives = objectives.filter(obj => obj.status === "AT_RISK").length;
  
  // Get all key results for all objectives
  const objectiveIds = objectives.map(obj => obj._id);
  const keyResults = await dbService.keyResult.find({ 
    objective: { $in: objectiveIds } 
  });
  
  // Calculate key result statistics
  const totalKeyResults = keyResults.length;
  const completedKeyResults = keyResults.filter(kr => kr.status === "COMPLETED").length;
  
  // Calculate average progress
  const totalProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0);
  const averageProgress = totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0;
  
  // Count objectives by status
  const statusCounts: Record<string, number> = {};
  objectives.forEach(obj => {
    statusCounts[obj.status] = (statusCounts[obj.status] || 0) + 1;
  });

  return {
    totalObjectives,
    completedObjectives,
    inProgressObjectives,
    atRiskObjectives,
    totalKeyResults,
    completedKeyResults,
    averageProgress,
    statusCounts
  };
}, {
  protected: true,
}); 