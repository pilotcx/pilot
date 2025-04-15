import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { taskService } from '@/lib/services/task';
import { projectService } from '@/lib/services/project';
import {createTaskSchema} from "@/lib/validations/task";
import {dbService} from "@/lib/db/service";

// Get tasks for a team's project
export const GET = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, projectId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, projectId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority') || '0') : undefined;
  const assignee = searchParams.get('assignee') || undefined;

  // Check if user is a member of the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Check if project exists and belongs to the team
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  if (project.team.toString() !== teamId) {
    throw new ApiError(400, 'Project does not belong to this team');
  }

  // Build query for filtering
  const query: any = { team: teamId, project: projectId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignee = assignee;

  // Get tasks
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const tasks = await taskService.getTasksByTeamProject(teamId, projectId, {
    page,
    limit,
    sort,
    query,
  });

  return {
    data: tasks.docs,
    pagination: tasks,
    message: 'Project tasks retrieved successfully',
  };
}, {
  protected: true,
});


export const POST = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, projectId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, projectId } = await params;
  const body = await request.json();

  // Validate the request body against the schema
  const result = createTaskSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Check if team exists and user has access to it
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Check if assignee is a member of the team
  const assignee = await dbService.teamMember.findById(result.data.assignee);
  if (!assignee || assignee.team.toString() !== teamId) {
    throw new ApiError(404, 'Assignee is not a member of this team');
  }

  // Get the project by code
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Verify the project belongs to the team
  if (project.team.toString() !== teamId) {
    throw new ApiError(400, 'Project does not belong to this team');
  }

  // Check if user has access to the project
  const isProjectMember = await projectService.isProjectMember(project._id.toString(), membership._id.toString());
  if (!isProjectMember) {
    throw new ApiError(403, 'You do not have access to this project');
  }

  // Override the project ID in the request with the one from the URL
  const taskData = {
    ...result.data,
    project: project._id.toString(),
  };

  // Create the task
  const task = await taskService.createTask(teamId, taskData);

  return {
    data: task,
    message: 'Task created successfully',
  };
}, {
  protected: true,
});
