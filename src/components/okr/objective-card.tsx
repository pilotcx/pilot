"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Objective, ObjectiveStatus } from "@/lib/types/models/okr";
import { Badge } from "@/components/ui/badge";
import { EditObjectiveDialog } from "./edit-objective-dialog";
import { CreateKeyResultDialog } from "./create-key-result-dialog";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiService from "@/lib/services/api";
import { toast } from "sonner";
import { KeyResultList } from "./key-result-list";
import dayjs from "dayjs";

interface ObjectiveCardProps {
  objective: Objective;
  onUpdate: () => void;
}

const statusColors: Record<ObjectiveStatus, string> = {
  NOT_STARTED: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
  AT_RISK: "bg-yellow-500",
};

export function ObjectiveCard({ objective, onUpdate }: ObjectiveCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateKRDialog, setShowCreateKRDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await apiService.deleteObjective(
        objective.team._id as string,
        objective._id as string
      );
      toast.success("Objective deleted successfully");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete objective");
    }
  };

  return (
    <Card className="gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{objective.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge
            variant="secondary"
            className={`${statusColors[objective.status]} text-white`}
          >
            {objective.status.replace("_", " ")}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          {objective.description}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{objective.progress}%</span>
          </div>
          <Progress value={objective.progress} />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Start: {dayjs(objective.startDate).format("DD/MM/YYYY")}</div>
          <div>End: {dayjs(objective.endDate).format("DD/MM/YYYY")}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Key Results</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateKRDialog(true)}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add KR
            </Button>
          </div>
          <KeyResultList
            objective={objective}
            onUpdate={onUpdate}
          />
        </div>
      </CardContent>

      <EditObjectiveDialog
        objective={objective}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={onUpdate}
      />

      <CreateKeyResultDialog
        objective={objective}
        open={showCreateKRDialog}
        onOpenChange={setShowCreateKRDialog}
        onCreate={onUpdate}
      />
    </Card>
  );
} 