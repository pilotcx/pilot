import { dbService } from "@/lib/db/service";
import { ObjectiveStatus } from "@/lib/types/models/okr";
import { withApi } from "@/lib/utils/withApi";
import { createObjectiveSchema } from "@/lib/validations/okr";
import { NextRequest } from "next/server";

interface Params {
  teamId: string;
}

// GET /api/teams/[teamId]/okr
export const GET = withApi(async (req: NextRequest, { params, searchParams }) => {
  const { teamId } = params as Params;
  const { status, startDate, endDate, ownerId } = Object.fromEntries(searchParams);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const query: any = { team: teamId };
  if (status) query.status = status;
  if (startDate) query.startDate = { $gte: new Date(startDate) };
  if (endDate) query.endDate = { $lte: new Date(endDate) };
  if (ownerId) query.owner = ownerId;

  const [objectives, total] = await Promise.all([
    dbService.objective.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "fullName email")
      .populate("team", "name slug")
      .populate({
        path: "keyResults",
        populate: {
          path: "owner",
          select: "fullName email",
        },
      }),
    dbService.objective.count(query),
  ]);

  return {
    data: objectives,
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

// POST /api/teams/[teamId]/okr
export const POST = withApi(async (req: NextRequest, { params }, decoded) => {
  const { teamId } = params as Params;
  const body = await req.json();
  console.log(body);
  const validatedData = createObjectiveSchema.safeParse(body);
  if (!validatedData.success) {
    throw new Error(validatedData.error.message);
  }

  const objective = await dbService.objective.create({
    ...validatedData.data,
    owner: decoded!.id as string,
    team: teamId as string,
    status: ObjectiveStatus.NOT_STARTED,
    progress: 0,
    keyResults: [],
    dueDate: new Date(validatedData.data.dueDate),
  });

  await objective.populate([
    { path: "owner", select: "fullName email" },
    { path: "team", select: "name slug" },
  ]);

  return { data: objective };
}, {
  protected: true,
}); 