import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { taskService } from '@/lib/services/task';
import { projectService } from '@/lib/services/project';
import { createTaskSchema } from '@/lib/validations/task';
import { dbService } from '@/lib/db/service';

// Get tasks for a team
export const GET = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority') || '0') : undefined;
  const assignee = searchParams.get('assignee') || undefined;
  const projectId = searchParams.get('project') || undefined;

  // Check if user is a member of the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Build query for filtering
  const query: any = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignee = assignee;
  if (projectId) query.project = projectId;

  // Get tasks
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const tasks = await taskService.getTasksByTeam(teamId, {
    page,
    limit,
    sort,
  });

  return {
    data: tasks.docs,
    pagination: tasks,
    message: 'Tasks retrieved successfully',
  };
}, {
  protected: true,
});
