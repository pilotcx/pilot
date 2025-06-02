import { NextRequest } from "next/server";
import { withApi } from "@/lib/utils/withApi";
import { Objective } from "@/lib/db/models/okr";
import { updateObjectiveSchema } from "@/lib/validations/okr";

interface Params {
  objectiveId: string;
}

// GET /api/teams/[teamId]/okr/[objectiveId]
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;

  const objective = await Objective.findById(objectiveId)
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

  const objective = await Objective.findByIdAndUpdate(
    objectiveId,
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

  const objective = await Objective.findByIdAndDelete(objectiveId);

  if (!objective) {
    throw new Error("Objective not found");
  }

  return { data: objective };
}, {
  protected: true,
}); 