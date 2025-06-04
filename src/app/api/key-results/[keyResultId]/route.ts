import { dbService } from "@/lib/db/service";
import { KeyResultStatus } from "@/lib/types/models/okr";
import { withApi } from "@/lib/utils/withApi";
import { updateKeyResultSchema } from "@/lib/validations/okr";
import { NextRequest } from "next/server";

interface Params {
  keyResultId: string;
}

// GET /api/key-results/[keyResultId]
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;

  const keyResult = await dbService.keyResult.findById(keyResultId)
    .populate("owner", "fullName email")
    .populate({
      path: "objective",
      populate: {
        path: "team",
        select: "name slug",
      },
    })
    .populate("task");

  if (!keyResult) {
    throw new Error("Key result not found");
  }

  return { data: keyResult };
}, {
  protected: true,
});

// PUT /api/key-results/[keyResultId]
export const PUT = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;
  const body = await req.json();

  const validatedData = updateKeyResultSchema.parse(body);

  // If dueDate is provided, convert to Date object
  if (validatedData.dueDate) {
    validatedData.dueDate = new Date(validatedData.dueDate);
  }

  // Update task reference if provided
  if (validatedData.taskId !== undefined) {
    if (validatedData.taskId && validatedData.taskId !== "") {
      // Associate with task
      const task = await dbService.task.findById(validatedData.taskId);
      if (!task) {
        return { error: "Task not found" };
      }
      validatedData.task = validatedData.taskId;
    } else {
      // Remove task association
      validatedData.task = null;
    }
    // Remove taskId as it's not part of the model
    delete validatedData.taskId;
  }

  // Calculate progress based on current and target values
  if (validatedData.current !== undefined && validatedData.target !== undefined) {
    const progress = Math.round((validatedData.current / validatedData.target) * 100);
    validatedData.progress = Math.min(100, Math.max(0, progress));

    // Update status based on progress
    if (progress >= 100) {
      validatedData.status = KeyResultStatus.COMPLETED;
    } else if (progress > 0) {
      validatedData.status = validatedData.status || KeyResultStatus.IN_PROGRESS;
    }
  }

  const keyResult = await dbService.keyResult.findOneAndUpdate(
    { _id: keyResultId },
    validatedData,
    { new: true }
  ).populate([
    { path: "owner", select: "fullName email" },
    {
      path: "objective",
      populate: {
        path: "team",
        select: "name slug",
      },
    },
    { path: "task" }
  ]);

  if (!keyResult) {
    throw new Error("Key result not found");
  }

  return { data: keyResult };
}, {
  protected: true,
});

// DELETE /api/key-results/[keyResultId]
export const DELETE = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;

  const keyResult = await dbService.keyResult.findById(keyResultId);
  if (!keyResult) {
    throw new Error("Key result not found");
  }

  await keyResult.deleteOne();

  return { success: true };
}, {
  protected: true,
}); 