import { NextRequest } from "next/server";
import { withApi } from "@/lib/utils/withApi";
import { KeyResult } from "@/lib/db/models/okr";
import { updateKeyResultSchema } from "@/lib/validations/okr";

interface Params {
  keyResultId: string;
}

// GET /api/teams/[teamId]/okr/[objectiveId]/key-results/[keyResultId]
export const GET = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;

  const keyResult = await KeyResult.findById(keyResultId)
    .populate("owner", "fullName email")
    .populate({
      path: "objective",
      populate: {
        path: "team",
        select: "name slug",
      },
    });

  if (!keyResult) {
    throw new Error("Key result not found");
  }

  return { data: keyResult };
}, {
  protected: true,
});

// PUT /api/teams/[teamId]/okr/[objectiveId]/key-results/[keyResultId]
export const PUT = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;
  const body = await req.json();

  const validatedData = updateKeyResultSchema.parse(body);

  // Calculate progress based on current and target values
  const progress = Math.round((validatedData.current / validatedData.target) * 100);
  validatedData.progress = Math.min(100, Math.max(0, progress));

  // Update status based on progress
  if (progress >= 100) {
    validatedData.status = "COMPLETED";
  } else if (progress > 0) {
    validatedData.status = validatedData.status || "IN_PROGRESS";
  }

  const keyResult = await KeyResult.findByIdAndUpdate(
    keyResultId,
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
  ]);

  if (!keyResult) {
    throw new Error("Key result not found");
  }

  return { data: keyResult };
}, {
  protected: true,
});

// DELETE /api/teams/[teamId]/okr/[objectiveId]/key-results/[keyResultId]
export const DELETE = withApi(async (req: NextRequest, { params }) => {
  const { keyResultId } = params as Params;

  const keyResult = await KeyResult.findByIdAndDelete(keyResultId);

  if (!keyResult) {
    throw new Error("Key result not found");
  }

  return { data: keyResult };
}, {
  protected: true,
}); 