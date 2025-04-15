import {dbService} from '@/lib/db/service';
import {ProjectRole} from '@/lib/types/models/project';
import {CreateProjectInput, UpdateProjectInput} from '@/lib/validations/project';
import {ApiError} from '@/lib/types/errors/api.error';
import {PaginateOptions} from 'mongoose';

class ProjectService {
  /**
   * Create a new project
   */
  async createProject(data: CreateProjectInput, teamMemberId: string) {
    await dbService.connect();

    // Check if project code is unique
    const existingProject = await dbService.project.findOne({code: data.code});
    if (existingProject) {
      throw new ApiError(400, 'Project code already exists');
    }

    // Get the team member to get their display name
    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    // Create the project
    const project = await dbService.project.create({
      name: data.name,
      description: data.description || '',
      avatar: data.avatar || '',
      code: data.code,
      team: data.team,
    });

    // Add the creator as a project owner
    await dbService.projectMember.create({
      role: ProjectRole.Owner,
      teamMember: teamMemberId,
      project: project!._id as string,
      displayName: teamMember.displayName,
    });

    return project;
  }

  /**
   * Get projects for a team with pagination
   */
  async getProjectsByTeam(teamId: string, options: PaginateOptions = {}) {
    await dbService.connect();

    const defaultOptions = {
      sort: {createdAt: -1},
      ...options,
    };

    return dbService.project.paginate({team: teamId}, defaultOptions);
  }

  /**
   * Get a project by ID
   */
  async getProjectById(projectId: string) {
    await dbService.connect();
    return dbService.project.findById(projectId);
  }

  /**
   * Get a project by code
   */
  async getProjectByCode(code: string) {
    await dbService.connect();
    return dbService.project.findOne({code});
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: UpdateProjectInput) {
    await dbService.connect();

    // Get the project
    const project = await dbService.project.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // If code is being changed, check if it's unique
    if (data.code && data.code !== project.code) {
      const existingProject = await dbService.project.findOne({code: data.code});
      if (existingProject) {
        throw new ApiError(400, 'Project code already exists');
      }
    }

    // Update the project
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.code) updateData.code = data.code;

    return dbService.project.update({_id: projectId}, updateData, {new: true});
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string) {
    await dbService.connect();

    // Get the project
    const project = await dbService.project.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Project deletion logic is handled here

    // Delete all project members first
    await dbService.projectMember.delete({project: projectId});

    // Delete the project
    await dbService.project.delete({_id: projectId});

    return {deleted: true};
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string, options: PaginateOptions = {}) {
    const defaultOptions = {
      sort: {createdAt: -1},
      populate: 'teamMember',
      ...options,
    };

    return dbService.projectMember.paginate({project: projectId}, defaultOptions);
  }

  /**
   * Get joined project of a member
   */
  async getJoinedProjects(memberId: string) {
    const tickets = await dbService.projectMember.find({
      teamMember: memberId,
    }).populate('project');
    return (tickets || []).map((ticket) => ticket.project);
  }

  /**
   * Add a member to a project
   */
  async addProjectMember(projectId: string, teamMemberId: string, role: ProjectRole = ProjectRole.Member) {
    // Check if project exists
    const project = await dbService.project.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if team member exists
    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    // Check if team member is from the same team as the project
    if (teamMember.team.toString() !== project.team.toString()) {
      throw new ApiError(400, 'Team member must be from the same team as the project');
    }

    // Check if member is already in the project
    const existingMember = await dbService.projectMember.findOne({
      project: projectId,
      teamMember: teamMemberId,
    });

    if (existingMember) {
      throw new ApiError(400, 'Member is already part of this project');
    }

    // Add the member to the project
    const projectMember = await dbService.projectMember.create({
      role,
      teamMember: teamMemberId,
      project: projectId,
      displayName: teamMember.displayName,
    });

    return projectMember;
  }

  /**
   * Update a project member's role
   */
  async updateProjectMember(projectId: string, teamMemberId: string, role: ProjectRole) {
    await dbService.connect();

    // Check if project member exists
    const projectMember = await dbService.projectMember.findOne({
      project: projectId,
      teamMember: teamMemberId,
    });

    if (!projectMember) {
      throw new ApiError(404, 'Project member not found');
    }

    // Update the role
    return dbService.projectMember.update(
      {_id: projectMember._id},
      {role},
      {new: true}
    );
  }

  /**
   * Remove a member from a project
   */
  async removeProjectMember(projectId: string, teamMemberId: string) {
    await dbService.connect();

    // Check if project member exists
    const projectMember = await dbService.projectMember.findOne({
      project: projectId,
      teamMember: teamMemberId,
    });

    if (!projectMember) {
      throw new ApiError(404, 'Project member not found');
    }

    // Count how many owners the project has
    const ownersCount = await dbService.projectMember.count({
      project: projectId,
      role: ProjectRole.Owner,
    });

    // Prevent removing the last owner
    if (projectMember.role === ProjectRole.Owner && ownersCount <= 1) {
      throw new ApiError(400, 'Cannot remove the last owner of a project');
    }

    // Remove the member
    await dbService.projectMember.delete({_id: projectMember._id});

    return {deleted: true};
  }

  /**
   * Check if a user is a member of a project
   */
  async isProjectMember(projectId: string, teamMemberId: string) {
    await dbService.connect();

    const projectMember = await dbService.projectMember.findOne({
      project: projectId,
      teamMember: teamMemberId,
    });

    return !!projectMember;
  }

  /**
   * Check if a user has a specific role in a project
   */
  async hasProjectRole(projectId: string, teamMemberId: string, roles: ProjectRole[]) {
    await dbService.connect();

    const projectMember = await dbService.projectMember.findOne({
      project: projectId,
      teamMember: teamMemberId,
      role: {$in: roles},
    });

    return !!projectMember;
  }
}

export const projectService = new ProjectService();
