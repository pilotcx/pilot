import { NextRequest } from "next/server";
import { withApi } from "@/lib/utils/withApi";
import { KeyResult } from "@/lib/db/models/okr";
import { createKeyResultSchema } from "@/lib/validations/okr";

interface Params {
  objectiveId: string;
}

// GET /api/teams/[teamId]/okr/[objectiveId]/key-results
export const GET = withApi(async (req: NextRequest, { params, searchParams }) => {
  const { objectiveId } = params as Params;
  const { status, ownerId } = Object.fromEntries(searchParams);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const query: any = { objective: objectiveId };
  if (status) query.status = status;
  if (ownerId) query.owner = ownerId;

  const [keyResults, total] = await Promise.all([
    KeyResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "fullName email")
      .populate({
        path: "objective",
        populate: {
          path: "team",
          select: "name slug",
        },
      }),
    KeyResult.countDocuments(query),
  ]);

  return {
    data: keyResults,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}, {
  protected: true,
});

// POST /api/teams/[teamId]/okr/[objectiveId]/key-results
export const POST = withApi(async (req: NextRequest, { params }) => {
  const { objectiveId } = params as Params;
  const body = await req.json();

  const validatedData = createKeyResultSchema.parse(body);

  const keyResult = await KeyResult.create({
    ...validatedData,
    objective: objectiveId,
  });

  await keyResult.populate([
    { path: "owner", select: "fullName email" },
    {
      path: "objective",
      populate: {
        path: "team",
        select: "name slug",
      },
    },
  ]);

  return { data: keyResult };
}, {
  protected: true,
}); 