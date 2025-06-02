"use client";

import { useEffect, useState } from "react";
import { KeyResult, Objective } from "@/lib/types/models/okr";
import apiService from "@/lib/services/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { EditKeyResultDialog } from "./edit-key-result-dialog";

interface KeyResultListProps {
  objective: Objective;
  onUpdate: () => void;
}

const statusColors = {
  NOT_STARTED: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  AT_RISK: "bg-yellow-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export function KeyResultList({ objective, onUpdate }: KeyResultListProps) {
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadKeyResults();
  }, [objective._id]);

  const loadKeyResults = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getObjectiveKeyResults(
        objective.team._id as string,
        objective._id as string
      );
      setKeyResults(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load key results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (kr: KeyResult) => {
    try {
      await apiService.deleteKeyResult(
        objective.team._id as string,
        objective._id as string,
        kr._id as string
      );
      toast.success("Key result deleted successfully");
      await loadKeyResults();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete key result");
    }
  };

  const handleEdit = (kr: KeyResult) => {
    setSelectedKR(kr);
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    await loadKeyResults();
    onUpdate();
  };

  if (isLoading) {
    return <div>Loading key results...</div>;
  }

  if (keyResults.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No key results yet. Add one to track progress.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {keyResults.map((kr) => (
        <div
          key={kr._id}
          className="bg-muted/50 rounded-lg p-3 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{kr.title}</h4>
                <Badge
                  variant="secondary"
                  className={`${
                    statusColors[kr.status]
                  } text-white text-xs`}
                >
                  {kr.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {kr.description}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(kr)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(kr)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {kr.current} / {kr.target} {kr.unit}
              </span>
            </div>
            <Progress value={kr.progress} />
          </div>
        </div>
      ))}

      {selectedKR && (
        <EditKeyResultDialog
          keyResult={selectedKR}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
} 