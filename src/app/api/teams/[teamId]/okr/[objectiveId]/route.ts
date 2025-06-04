import { dbService } from "@/lib/db/service";
import { withApi } from "@/lib/utils/withApi";
import { updateObjectiveSchema } from "@/lib/validations/okr";
import { NextRequest } from "next/server";

interface Params {
  objectiveId: string;
}

// GET /api/teams/[teamId]/okr/[objectiveId]
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;

  const objective = await dbService.objective.findById(objectiveId)
    .populate("owner", "fullName email")
    .populate("team", "name slug")
    .populate({
      path: "keyResults",
      populate: {
        path: "owner",
        select: "fullName email",
      },
    });

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
});

// PUT /api/teams/[teamId]/okr/[objectiveId]
export const PUT = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;
  const body = await req.json();

  const validatedData = updateObjectiveSchema.parse(body);

  const objective = await dbService.objective.findOneAndUpdate(
    { _id: objectiveId },
    validatedData,
    { new: true }
  ).populate([
    { path: "owner", select: "fullName email" },
    { path: "team", select: "name slug" },
    {
      path: "keyResults",
      populate: {
        path: "owner",
        select: "fullName email",
      },
    },
  ]);

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
});

// DELETE /api/teams/[teamId]/okr/[objectiveId]
export const DELETE = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;

  const objective = await dbService.objective.deleteOne({ _id: objectiveId });

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
}); 