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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiService from "@/lib/services/api";
import { KeyResult, Objective } from "@/lib/types/models/okr";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateKeyResultDialog } from "./create-key-result-dialog";
import { EditObjectiveDialog } from "./edit-objective-dialog";
import { EditKeyResultDialog } from "./edit-key-result-dialog";
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

interface ObjectiveListItemProps {
  objective: Objective;
  onUpdate: () => void;
  initialKeyResults?: KeyResult[];
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  AT_RISK: "bg-yellow-500",
  FAILED: "bg-red-500",
};

export function ObjectiveListItem({
  objective,
  onUpdate,
  initialKeyResults = [],
}: ObjectiveListItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateKRDialog, setShowCreateKRDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyResults, setKeyResults] = useState<KeyResult[]>(initialKeyResults);
  const [isLoading, setIsLoading] = useState(false);
  const [keyResultsLoaded, setKeyResultsLoaded] = useState(
    initialKeyResults.length > 0
  );
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
  const [isEditKeyResultDialogOpen, setIsEditKeyResultDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingKeyResult, setDeletingKeyResult] = useState<KeyResult | null>(null);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteObjective(objective._id);
      toast.success("Objective deleted successfully");
      onUpdate();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete objective");
    }
  };

  const toggleExpand = async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Load key results only when expanding and not already loaded
    if (newExpandedState && !keyResultsLoaded) {
      await loadKeyResults();
    }
  };

  const loadKeyResults = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getObjectiveKeyResults(objective._id);
      setKeyResults(response.data);
      setKeyResultsLoaded(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to load key results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyResultUpdated = async () => {
    await loadKeyResults();
    onUpdate();
  };

  const handleKeyResultDeleteClick = (kr: KeyResult) => {
    setDeletingKeyResult(kr);
  };

  const handleDeleteKeyResult = async () => {
    if (!deletingKeyResult) return;

    try {
      await apiService.deleteKeyResult(deletingKeyResult._id);
      toast.success("Key result deleted successfully");
      await loadKeyResults();
      onUpdate();
      setDeletingKeyResult(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete key result");
    }
  };

  const handleEditKeyResult = (kr: KeyResult) => {
    setEditingKeyResult(kr);
    setIsEditKeyResultDialogOpen(true);
  };

  // Check if a key result's task might cause delays
  const taskMayCauseDelay = (kr: KeyResult): boolean => {
    if (!kr.task) return false;

    const task = typeof kr.task === "string" ? null : (kr.task as any);
    if (!task || !task.dueDate) return false;

    return dayjs(task.dueDate).isAfter(dayjs(kr.dueDate));
  };

  // Function to get abbreviated status text
  const getShortStatus = (status: string): string => {
    switch (status) {
      case "NOT_STARTED":
        return "NS";
      case "IN_PROGRESS":
        return "IP";
      case "COMPLETED":
        return "Done";
      case "AT_RISK":
        return "Risk";
      case "FAILED":
        return "Fail";
      default:
        return status;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden mb-2">
      <div
        className="flex items-center justify-between py-3 px-4 cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <h3 className="font-medium">{objective.title}</h3>
          <Badge
            variant="secondary"
            className={`${
              statusColors[objective.status]
            } text-white text-xs hover:bg-unset ml-1`}
          >
            {objective.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {dayjs(objective.dueDate).format("DD/MM/YYYY")}
          </div>
          <div className="flex items-center gap-1 w-32">
            <Progress value={Number(objective.progress) || 0} className="w-20 h-2" />
            <span className="text-xs">{objective.progress || 0}%</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleDeleteClick}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-background">
          {objective.description && (
            <div className="text-sm text-muted-foreground mb-1">
              {objective.description}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5 mb-2">
              <h3 className="text-xs font-medium uppercase text-muted-foreground">
                Key Results
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateKRDialog(true);
                }}
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>

            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading key results...
              </div>
            ) : keyResults.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No key results yet. Add one to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {keyResults.map((kr) => (
                  <div
                    key={kr._id}
                    className="flex flex-col gap-1.5 border-b pb-2 mb-2 last:border-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-[10px] h-[10px] rounded-full flex-shrink-0",
                          statusColors[kr.status]
                        )}
                      ></div>
                      <h4 className="font-medium text-sm flex-1 truncate pr-1">
                        {kr.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className="text-xs inline-flex items-center rounded-sm px-1 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: statusColors[kr.status].replace(
                              "bg-",
                              "var(--"
                            ),
                            color: "white",
                          }}
                        >
                          {getShortStatus(kr.status)}
                        </span>
                        {taskMayCauseDelay(kr) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Potential delay due to task due date
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <div className="flex gap-2 items-center text-xs">
                          <div className="flex-1 flex items-center gap-2">
                            {kr.task && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="font-medium">Task:</span>
                                <span className="truncate max-w-[120px]">
                                  {typeof kr.task === "string"
                                    ? kr.task
                                    : kr.task.title}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 flex-1">
                              <Progress
                                value={Number(kr.progress) || 0}
                                className="h-2 w-40"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                              {kr.current}/{kr.target} {kr.unit}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-1"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditKeyResult(kr)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleKeyResultDeleteClick(kr)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
        onCreate={handleKeyResultUpdated}
      />

      {editingKeyResult && (
        <EditKeyResultDialog
          keyResult={editingKeyResult}
          open={isEditKeyResultDialogOpen}
          onOpenChange={(open) => {
            setIsEditKeyResultDialogOpen(open);
            if (!open) setEditingKeyResult(null);
          }}
          onUpdate={handleKeyResultUpdated}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the objective
              and all associated key results.
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
            <AlertDialogAction onClick={handleDeleteKeyResult} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
