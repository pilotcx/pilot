"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import apiService from "@/lib/services/api";
import { Objective } from "@/lib/types/models/okr";
import dayjs from "dayjs";
import { CalendarIcon, ChevronDown, ChevronRight, MoreHorizontal, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateKeyResultDialog } from "./create-key-result-dialog";
import { EditObjectiveDialog } from "./edit-objective-dialog";
import { KeyResultList } from "./key-result-list";
import { cn } from "@/lib/utils";
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

interface ObjectiveCardProps {
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

export function ObjectiveCard({ objective, onUpdate }: ObjectiveCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateKRDialog, setShowCreateKRDialog] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="gap-4 h-fit">
      <CardHeader 
        className="flex flex-row items-start justify-between space-y-0 pb-2 cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-xl font-bold">{objective.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={`${
                statusColors[objective.status]
              } text-white hover:bg-unset`}
            >
              {objective.status.replace("_", " ")}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              Due: {dayjs(objective.dueDate).format("DD/MM/YYYY")}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
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
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        <div className="text-sm text-muted-foreground">
          {objective.description}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{objective.progress || 0}%</span>
          </div>
          <Progress value={Number(objective.progress) || 0} />
        </div>

        <div className={cn("space-y-2", isExpanded ? "block" : "hidden")}>
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
          <KeyResultList objective={objective} onUpdate={onUpdate} />
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
    </Card>
  );
}
