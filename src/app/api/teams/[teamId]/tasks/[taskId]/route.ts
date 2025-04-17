import { dbService } from "@/lib/db/service";
import { taskService } from "@/lib/services/task";
import { ApiError } from "@/lib/types/errors/api.error";
import { withApi } from "@/lib/utils/withApi";
import { updateTaskSchema } from "@/lib/validations/task";
import { NextRequest } from "next/server";

// Get task by ID within a team
export const GET = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string; taskId: string }> }
  ) => {
    const { teamId, taskId } = await params;

    const team = await dbService.team.findById(teamId);
    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    if (task.team.toString() !== teamId) {
      throw new ApiError(
        403,
        "This task does not belong to the specified team"
      );
    }

    await task.populate([
      {
        path: "assignee",
        populate: { path: "user", select: "fullName email avatar" },
      },
      { path: "project" },
    ]);

    return {
      data: task,
      message: "Task retrieved successfully",
    };
  },
  {
    protected: true,
  }
);

// Update task
export const PUT = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string; taskId: string }> }
  ) => {
    const { teamId, taskId } = await params;
    const body = await request.json();

    // Verify the team exists
    const team = await dbService.team.findById(teamId);
    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Validate request body
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      throw new ApiError(400, result.error.errors[0].message);
    }

    // Get the task
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Check if the task belongs to the team
    if (task.team.toString() !== teamId) {
      throw new ApiError(
        403,
        "This task does not belong to the specified team"
      );
    }

    // Update the task
    const updatedTask = await taskService.updateTask(taskId, result.data);

    await updatedTask?.populate([
      {
        path: "assignee",
        populate: { path: "user", select: "name email avatar" },
      },
      { path: "project" },
    ]);

    return {
      data: updatedTask,
      message: "Task updated successfully",
    };
  },
  {
    protected: true,
  }
);

// Delete task
export const DELETE = withApi(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string; taskId: string }> }
  ) => {
    const { teamId, taskId } = await params;

    // Verify the team exists
    const team = await dbService.team.findById(teamId);
    if (!team) {
      throw new ApiError(404, "Team not found");
    }

    // Get the task
    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    // Check if the task belongs to the team
    if (task.team.toString() !== teamId) {
      throw new ApiError(
        403,
        "This task does not belong to the specified team"
      );
    }

    // Delete the task
    await taskService.deleteTask(taskId);

    // Update team task count
    await dbService.team.update({ _id: teamId }, { $inc: { tasksCount: -1 } });

    return {
      message: "Task deleted successfully",
    };
  },
  {
    protected: true,
  }
);
