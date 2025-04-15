import {dbService} from '@/lib/db/service';
import {TaskPriority, TaskStatus} from '@/lib/types/models/task';
import {CreateTaskInput, UpdateTaskInput} from '@/lib/validations/task';
import {ApiError} from '@/lib/types/errors/api.error';
import {PaginateOptions} from 'mongoose';

class TaskService {
  async createTask(teamId: string, data: CreateTaskInput) {
    const task = await dbService.task.create({
      title: data.title,
      description: data.description || '',
      status: TaskStatus.Pending,
      assignee: data.assignee,
      dueDate: new Date(data.dueDate),
      priority: data.priority ?? TaskPriority.Medium,
      team: teamId,
      project: data.project,
    });

    // Update team task count
    await dbService.team.update(
      {_id: teamId},
      {$inc: {tasksCount: 1}}
    );

    return task;
  }

  async getTasksByTeam(teamId: string, options: PaginateOptions = {}) {
    const defaultOptions = {
      sort: {createdAt: -1},
      populate: 'assignee',
      ...options,
    };

    return dbService.task.paginate({team: teamId}, defaultOptions);
  }

  async getTasksByProject(projectId: string, options: PaginateOptions = {}) {
    await dbService.connect();

    const defaultOptions = {
      sort: {createdAt: -1},
      populate: ['assignee', 'project'],
      ...options,
    };

    return dbService.task.paginate({project: projectId}, defaultOptions);
  }

  async getTasksByTeamProject(teamId: string, projectId: string, options: PaginateOptions & { query?: any } = {}) {
    await dbService.connect();

    // Verify that the project belongs to the team
    const project = await dbService.project.findOne({_id: projectId, team: teamId});
    if (!project) {
      throw new ApiError(404, 'Project not found in this team');
    }

    const {query = {}, ...paginateOptions} = options;

    // Build the final query
    const finalQuery = {
      team: teamId,
      project: projectId,
      ...query
    };

    const defaultOptions = {
      sort: {createdAt: -1},
      populate: ['assignee', 'project'],
      ...paginateOptions,
    };

    return dbService.task.paginate(finalQuery, defaultOptions);
  }

  async getUserTeamTasks(teamId: string, userId: string, options: PaginateOptions & { query?: any } = {}) {
    await dbService.connect();

    // Get the team membership for the user
    const membership = await dbService.teamMember.findOne({
      team: teamId,
      user: userId
    });

    if (!membership) {
      throw new ApiError(403, 'User is not a member of this team');
    }

    // Get all projects that the user is a member of
    const projectMemberships = await dbService.projectMember.find({
      teamMember: membership._id
    });

    const projectIds = projectMemberships.map(pm => pm.project);

    // If user is not a member of any projects, return empty result
    if (projectIds.length === 0) {
      return {
        docs: [],
        totalDocs: 0,
        limit: options.limit || 10,
        page: options.page || 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
        prevPage: null,
        nextPage: null,
      };
    }

    const {query = {}, ...paginateOptions} = options;

    // Build the final query to get tasks from all projects the user is a member of
    const finalQuery = {
      team: teamId,
      project: {$in: projectIds},
      ...query
    };

    const defaultOptions = {
      sort: {createdAt: -1},
      populate: ['assignee', 'project'],
      ...paginateOptions,
    };

    return dbService.task.paginate(finalQuery, defaultOptions);
  }

  async getTaskById(taskId: string) {
    await dbService.connect();
    return dbService.task.findById(taskId);
  }

  async updateTask(taskId: string, data: UpdateTaskInput) {
    await dbService.connect();

    // Get the task
    const task = await dbService.task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Update the task
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.assignee) updateData.assignee = data.assignee;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.priority) updateData.priority = data.priority;
    if (data.project) updateData.project = data.project;

    return dbService.task.update({_id: taskId}, updateData, {new: true});
  }

  async deleteTask(taskId: string) {
    await dbService.connect();

    // Get the task
    const task = await dbService.task.findById(taskId);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Delete the task
    await dbService.task.delete({_id: taskId});

    // Update team task count
    await dbService.team.update(
      {_id: task.team},
      {$inc: {tasksCount: -1}}
    );

    return {deleted: true};
  }
}

export const taskService = new TaskService();
