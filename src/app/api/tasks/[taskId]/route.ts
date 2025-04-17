import { dbService } from "@/lib/db/service";
import { projectService } from "@/lib/services/project";
import { taskService } from "@/lib/services/task";
import { teamService } from "@/lib/services/team";
import { ApiError } from "@/lib/types/errors/api.error";
import { TeamRole } from "@/lib/types/models/team";
import { withApi } from "@/lib/utils/withApi";
import { updateTaskSchema } from "@/lib/validations/task";
import { NextRequest } from "next/server";

// Get a specific task
export const GET = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
    decoded
  ) => {
    if (!decoded) {
      throw new ApiError(401, "Unauthorized");
    }

    const taskId = (await params).taskId;
    const task = await taskService.getTaskById(taskId);

    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Check if user has access to the team
    const { membership } = await teamService.getTeamWithMembership(
      task.team.toString(),
      decoded.id
    );
    if (!membership) {
      throw new ApiError(403, "You do not have access to this team");
    }

    return {
      data: task,
      message: "Task retrieved successfully",
    };
  },
  {
    protected: true,
  }
);

// Update a task
export const PUT = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
    decoded
  ) => {
    if (!decoded) {
      throw new ApiError(401, "Unauthorized");
    }

    const taskId = (await params).taskId;
    const body = await request.json();

    // Validate the request body against the schema
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      throw new ApiError(400, result.error.message);
    }

    // Get the task
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Check if team exists and user has access to it
    const { team, membership } = await teamService.getTeamWithMembership(
      task.team.toString(),
      decoded.id
    );
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
    if (!membership) {
      throw new ApiError(403, "You do not have access to this team");
    }

    // Only team owners, managers, or the assignee can update tasks
    const isOwnerOrManager = [TeamRole.Owner, TeamRole.Manager].includes(
      membership.role as TeamRole
    );
    const isAssignee = task.assignee.toString() === membership._id.toString();

    if (!isOwnerOrManager && !isAssignee) {
      throw new ApiError(403, "You do not have permission to update this task");
    }

    // If assignee is being changed, check if new assignee is a team member
    if (
      result.data.assignee &&
      result.data.assignee !== task.assignee.toString()
    ) {
      const newAssignee = await dbService.teamMember.findById(
        result.data.assignee
      );
      if (
        !newAssignee ||
        newAssignee.team.toString() !== task.team.toString()
      ) {
        throw new ApiError(404, "New assignee is not a member of this team");
      }
    }

    // If project is being changed, check if project exists and belongs to the team
    if (
      result.data.project &&
      result.data.project !== task.project.toString()
    ) {
      const project = await projectService.getProjectById(result.data.project);
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
      if (project.team.toString() !== task.team.toString()) {
        throw new ApiError(400, "Project does not belong to this team");
      }
    }

    // Update the task
    const updatedTask = await taskService.updateTask(taskId, result.data);

    return {
      data: updatedTask,
      message: "Task updated successfully",
    };
  },
  {
    protected: true,
  }
);

// Delete a task
export const DELETE = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
    decoded
  ) => {
    if (!decoded) {
      throw new ApiError(401, "Unauthorized");
    }

    const taskId = (await params).taskId;

    // Get the task
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Check if team exists and user has access to it with appropriate permissions
    const { team, membership } = await teamService.getTeamWithMembership(
      task.team.toString(),
      decoded.id
    );
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
    if (!membership) {
      throw new ApiError(403, "You do not have access to this team");
    }

    // Check if user has appropriate permissions (owner or manager)
    const isOwnerOrManager = [TeamRole.Owner, TeamRole.Manager].includes(
      membership.role as TeamRole
    );
    if (!isOwnerOrManager) {
      throw new ApiError(403, "You do not have permission to delete this task");
    }

    // Delete the task
    await taskService.deleteTask(taskId);

    return {
      data: null,
      message: "Task deleted successfully",
    };
  },
  {
    protected: true,
  }
);
