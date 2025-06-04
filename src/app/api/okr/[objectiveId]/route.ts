import { dbService } from "@/lib/db/service";
import { ObjectiveStatus } from "@/lib/types/models/okr";
import { withApi } from "@/lib/utils/withApi";
import { updateObjectiveSchema } from "@/lib/validations/okr";
import { NextRequest } from "next/server";

interface Params {
  objectiveId: string;
}

// GET /api/okr/[objectiveId]
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;

  const objective = await dbService.objective.findById(objectiveId)
    .populate("owner", "fullName email")
    .populate("team", "name slug")
    .populate({
      path: "keyResults",
      populate: [
        { path: "owner", select: "fullName email" },
        { path: "task" }
      ]
    });

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
});

// PUT /api/okr/[objectiveId]
export const PUT = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;
  const body = await req.json();

  const validatedData = updateObjectiveSchema.parse(body);

  // If dueDate is provided, convert to Date object
  if (validatedData.dueDate) {
    validatedData.dueDate = new Date(validatedData.dueDate);
  }

  const objective = await dbService.objective.findOneAndUpdate(
    { _id: objectiveId },
    validatedData,
    { new: true }
  ).populate([
    { path: "owner", select: "fullName email" },
    { path: "team", select: "name slug" }
  ]);

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
});

// DELETE /api/okr/[objectiveId]
export const DELETE = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;

  const objective = await dbService.objective.findById(objectiveId);
  if (!objective) {
    throw new Error("Objective not found");
  }

  // Delete associated key results
  await dbService.keyResult.deleteMany({ objective: objectiveId });

  // Delete the objective
  await objective.deleteOne();

  return { success: true };
}, {
  protected: true,
}); 