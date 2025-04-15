"use client";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {CreateTeamRequestInput, createTeamRequestSchema, TeamRequest} from "@/lib/types/models/team-request";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {useEffect, useState} from "react";
import {TeamMember, TeamRole} from "@/lib/types/models/team";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTeam} from "@/components/providers/team-provider";

interface CreateTeamRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  onRequestCreated: (request: TeamRequest) => void;
}

export function CreateTeamRequestDialog({
                                          open,
                                          onOpenChange,
                                          teamId,
                                          onRequestCreated,
                                        }: CreateTeamRequestDialogProps) {
  const {team} = useTeam();
  const [createTeamRequest, {loading: isSubmitting}] = useApi(api.createTeamRequest);
  const [getTeamMembers, {data: membersData, loading: loadingMembers}] = useApi(api.getTeamMembers);
  const [reviewers, setReviewers] = useState<TeamMember[]>([]);

  // Fetch team members who can be reviewers (managers and owners)
  useEffect(() => {
    if (open && teamId) {
      const fetchReviewers = async () => {
        try {
          const response = await getTeamMembers(teamId);
          console.log(response.data);
          if (response.data) {
            // Filter for managers and owners only
            const reviewerMembers = response.data.filter(
              (member: TeamMember) => member.role === TeamRole.Manager || member.role === TeamRole.Owner
            );
            setReviewers(reviewerMembers);
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to load reviewers");
        }
      };

      fetchReviewers();
    }
  }, [open, teamId, getTeamMembers]);

  const form = useForm<CreateTeamRequestInput>({
    resolver: zodResolver(createTeamRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      reviewer: undefined,
    },
  });

  const onSubmit = async (data: CreateTeamRequestInput) => {
    try {
      const response = await createTeamRequest(teamId, data);
      if (response.data) {
        onRequestCreated(response.data);
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Submit a new request to the team managers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Request title" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your request in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reviewer"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Assign to Reviewer (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reviewer"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingMembers ? (
                        <SelectItem value="loading" disabled>
                          Loading reviewers...
                        </SelectItem>
                      ) : reviewers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No reviewers available
                        </SelectItem>
                      ) : (
                        <>
                          {reviewers.map((reviewer) => <SelectItem
                            key={reviewer._id as string}
                            value={reviewer._id!.toString()}
                          >
                            {reviewer.displayName} ({reviewer.role})
                          </SelectItem>)}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
