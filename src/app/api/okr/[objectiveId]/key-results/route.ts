import { dbService } from "@/lib/db/service";
import { KeyResultStatus } from "@/lib/types/models/okr";
import { withApi } from "@/lib/utils/withApi";
import { createKeyResultSchema } from "@/lib/validations/okr";
import { NextRequest } from "next/server";

interface Params {
  objectiveId: string;
}

// GET /api/okr/[objectiveId]/key-results
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
    dbService.keyResult.find(query)
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
      })
      .populate("task"),
    dbService.keyResult.count(query),
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

// POST /api/okr/[objectiveId]/key-results
export const POST = withApi(async (req: NextRequest, { params }, decoded) => {
  const { objectiveId } = params as Params;
  const body = await req.json();

  const validatedData = createKeyResultSchema.safeParse(body);

  if (!validatedData.success) {
    return { error: validatedData.error.message };
  }

  const objective = await dbService.objective.findById(objectiveId);
  if (!objective) {
    return { error: "Objective not found" };
  }

  // Prepare key result data
  const keyResultData: any = {
    title: validatedData.data.title,
    description: validatedData.data.description,
    target: validatedData.data.target,
    current: validatedData.data.current,
    unit: validatedData.data.unit,
    dueDate: new Date(validatedData.data.dueDate),
    owner: decoded!.id,
    objective: objectiveId,
    status: KeyResultStatus.NOT_STARTED,
    progress: 0
  };

  // If a task is associated, add it to the data
  if (validatedData.data.taskId) {
    const task = await dbService.task.findById(validatedData.data.taskId);
    if (task) {
      keyResultData.task = validatedData.data.taskId;
    }
  }

  const keyResult = await dbService.keyResult.create(keyResultData);

  await keyResult.populate([
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

  return { data: keyResult };
}, {
  protected: true,
}); 