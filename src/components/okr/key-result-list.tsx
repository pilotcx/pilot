"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import apiService from "@/lib/services/api";
import { KeyResult, Objective } from "@/lib/types/models/okr";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditKeyResultDialog } from "./edit-key-result-dialog";
import dayjs from "dayjs";
import { Task } from "@/lib/types/models/task";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KeyResultListProps {
  objective: Objective;
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  AT_RISK: "bg-yellow-500",
  FAILED: "bg-red-500",
};

export function KeyResultList({ objective, onUpdate }: KeyResultListProps) {
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingKeyResult, setDeletingKeyResult] = useState<KeyResult | null>(null);

  useEffect(() => {
    loadKeyResults();
  }, [objective._id]);

  const loadKeyResults = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getObjectiveKeyResults(objective._id);
      setKeyResults(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load key results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (kr: KeyResult) => {
    setDeletingKeyResult(kr);
  };

  const handleDelete = async () => {
    if (!deletingKeyResult) return;

    try {
      await apiService.deleteKeyResult(deletingKeyResult._id);
      toast.success("Key result deleted successfully");
      loadKeyResults();
      onUpdate();
      setDeletingKeyResult(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete key result");
    }
  };

  const handleEdit = (kr: KeyResult) => {
    setEditingKeyResult(kr);
  };

  const handleKeyResultUpdated = () => {
    loadKeyResults();
    onUpdate();
  };

  // Check if a key result's task might cause delays
  const taskMayCauseDelay = (kr: KeyResult): boolean => {
    if (!kr.task) return false;
    
    const task = typeof kr.task === 'string' ? null : kr.task as any;
    if (!task || !task.dueDate) return false;
    
    return dayjs(task.dueDate).isAfter(dayjs(kr.dueDate));
  };

  if (isLoading) {
    return <div>Loading key results...</div>;
  }

  return (
    <div className="space-y-3">
      {keyResults.map((kr) => (
        <div key={kr._id} className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{kr.title}</h4>
                <Badge
                  variant="secondary"
                  className={`${
                    statusColors[kr.status]
                  } text-white text-xs hover:bg-unset`}
                >
                  {kr.status.replace("_", " ")}
                </Badge>
                {taskMayCauseDelay(kr) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This key result might be delayed due to the associated task's due date.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{kr.description}</p>
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
                  onClick={() => handleDeleteClick(kr)}
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
            <Progress value={Number(kr.progress) || 0} />
          </div>
          
          {kr.task && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Associated Task:</span> {typeof kr.task === 'string' ? kr.task : kr.task.title}
            </div>
          )}
        </div>
      ))}

      {editingKeyResult && (
        <EditKeyResultDialog
          keyResult={editingKeyResult}
          open={!!editingKeyResult}
          onOpenChange={(open) => !open && setEditingKeyResult(null)}
          onUpdate={handleKeyResultUpdated}
        />
      )}
      
      {/* Delete Key Result Dialog */}
      <AlertDialog 
        open={!!deletingKeyResult} 
        onOpenChange={(open) => !open && setDeletingKeyResult(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this key result.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
