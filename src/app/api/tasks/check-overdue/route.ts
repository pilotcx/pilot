import { taskService } from "@/lib/services/task";
import { withApi } from "@/lib/utils/withApi";
import { NextRequest } from "next/server";

// API route to check and update overdue tasks
// This can be called by a CRON job or scheduler
export const POST = withApi(
  async (request: NextRequest) => {
    // This route should be called by a CRON job or scheduler periodically
    const updatedCount = await taskService.updateOverdueTasks();
    
    return {
      data: { updatedCount },
      message: `${updatedCount} tasks marked as overdue`,
    };
  },
  {
    protected: true, // Require authentication
  }
); 