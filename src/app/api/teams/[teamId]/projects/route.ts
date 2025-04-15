import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { projectService } from '@/lib/services/project';
import { createProjectSchema } from '@/lib/validations/project';
import { TeamRole } from '@/lib/types/models/team';
import { dbService } from '@/lib/db/service';

// Get projects for a team
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

  // Check if user is a member of the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get projects
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const projects = await projectService.getProjectsByTeam(teamId, {
    page,
    limit,
    sort,
  });

  return {
    data: projects.docs,
    pagination: projects,
    message: 'Projects retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new project
export const POST = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId } = await params;
  const body = await request.json();

  // Validate the request body against the schema
  const result = createProjectSchema.safeParse({
    ...body,
    team: teamId, // Ensure the team ID from the URL is used
  });

  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Check if team exists
  const team = await dbService.team.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is a member of the team with appropriate permissions
  const membership = await dbService.teamMember.findOne({
    team: teamId,
    user: decoded.id,
    role: { $in: [TeamRole.Owner, TeamRole.Manager] },
  });

  if (!membership) {
    throw new ApiError(403, 'You do not have permission to create projects in this team');
  }

  // Create the project and add the creator as a project owner
  const project = await projectService.createProject(result.data, membership._id.toString());

  return {
    data: project,
    message: 'Project created successfully',
  };
}, {
  protected: true,
});
