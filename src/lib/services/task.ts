import {dbService} from '@/lib/db/service';
import {TaskPriority, TaskStatus} from '@/lib/types/models/task';
import {CreateTaskInput, UpdateTaskInput} from '@/lib/validations/task';
import {ApiError} from '@/lib/types/errors/api.error';
import {PaginateOptions} from 'mongoose';

class TaskService {
  async createTask(teamId: string, data: CreateTaskInput) {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    const isPastDue = dueDate < now;
    
    const task = await dbService.task.create({
      title: data.title,
      description: data.description || '',
      status: TaskStatus.Pending,
      assignee: data.assignee,
      dueDate: dueDate,
      priority: data.priority ?? TaskPriority.Medium,
      team: teamId,
      project: data.project,
      overdue: isPastDue,
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

    const project = await dbService.project.findOne({_id: projectId, team: teamId});
    if (!project) {
      throw new ApiError(404, 'Project not found in this team');
    }

    const {query = {}, ...paginateOptions} = options;

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

    const membership = await dbService.teamMember.findOne({
      team: teamId,
      user: userId
    });

    if (!membership) {
      throw new ApiError(403, 'User is not a member of this team');
    }

    const projectMemberships = await dbService.projectMember.find({
      teamMember: membership._id
    });

    const projectIds = projectMemberships.map(pm => pm.project);

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
    if (data.assignee) updateData.assignee = data.assignee;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.priority) updateData.priority = data.priority;
    if (data.project) updateData.project = data.project;

    // Handle status update and overdue logic
    const now = new Date();
    const dueDate = data.dueDate ? new Date(data.dueDate) : task.dueDate;
    const isPastDue = new Date(dueDate) < now;
    
    updateData.overdue = isPastDue && (!data.status || (data.status !== TaskStatus.Completed && data.status !== TaskStatus.Late));
    
    // Handle status changes with proper logic
    if (data.status) {
      // If task is being marked as completed and is past due date, mark as Late instead
      if (data.status === TaskStatus.Completed && isPastDue) {
        updateData.status = TaskStatus.Late;
      } else {
        updateData.status = data.status;
      }
    }

    return dbService.task.update({_id: taskId}, updateData);
  }

  /**
   * Updates overdue status for tasks
   * This method should be called on a schedule to mark tasks as overdue
   * if they are past their due date and not completed
   */
  async updateOverdueTasks() {
    await dbService.connect();
    const now = new Date();
    
    // Find all tasks that are past due date, not completed/late, and not already marked as overdue
    const overdueTasks = await dbService.task.find({
      dueDate: { $lt: now },
      status: { $nin: [TaskStatus.Completed, TaskStatus.Late] },
      overdue: false
    });
    
    // Update all found tasks to be marked as overdue
    for (const task of overdueTasks) {
      await dbService.task.update(
        { _id: task._id },
        { overdue: true }
      );
    }
    
    return overdueTasks.length;
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
