"use client";

import { CreateObjectiveDialog } from "@/components/okr/create-objective-dialog";
import { ObjectiveCard } from "@/components/okr/objective-card";
import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiService from "@/lib/services/api";
import { Objective, ObjectiveStatus } from "@/lib/types/models/okr";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ObjectivesPage() {
  const { team } = useTeam();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | "ALL">(
    "ALL"
  );

  useEffect(() => {
    loadObjectives();
  }, [team._id]);

  const loadObjectives = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTeamObjectives(team._id as string, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setObjectives(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load objectives");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateObjective = async () => {
    setShowCreateDialog(false);
    await loadObjectives();
  };

  const filteredObjectives = objectives;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Objectives</h1>
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ObjectiveStatus | "ALL")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(ObjectiveStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Objective
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : filteredObjectives.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No objectives found. Create your first objective to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredObjectives.map((objective) => (
            <ObjectiveCard
              key={objective._id}
              objective={objective}
              onUpdate={loadObjectives}
            />
          ))}
        </div>
      )}

      <CreateObjectiveDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateObjective}
      />
    </div>
  );
}
