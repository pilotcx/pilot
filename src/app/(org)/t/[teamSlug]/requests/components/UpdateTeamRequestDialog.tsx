"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TeamRequest, TeamRequestStatus, UpdateTeamRequestInput, updateTeamRequestSchema } from "@/lib/types/models/team-request";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UpdateTeamRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: TeamRequest;
  onUpdateRequest: (status: TeamRequestStatus, responseNote?: string) => void;
}

export function UpdateTeamRequestDialog({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: UpdateTeamRequestDialogProps) {
  const form = useForm<UpdateTeamRequestInput>({
    resolver: zodResolver(updateTeamRequestSchema),
    defaultValues: {
      status: TeamRequestStatus.PENDING,
      responseNote: "",
    },
  });

  const onSubmit = async (data: UpdateTeamRequestInput) => {
    onUpdateRequest(data.status, data.responseNote);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Respond to Request</DialogTitle>
          <DialogDescription>
            Update the status of this request and provide a response.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={TeamRequestStatus.APPROVED} id="approved" />
                        <Label htmlFor="approved" className="font-normal">Approve</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={TeamRequestStatus.DECLINED} id="declined" />
                        <Label htmlFor="declined" className="font-normal">Decline</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={TeamRequestStatus.IN_REVIEW} id="in-review" />
                        <Label htmlFor="in-review" className="font-normal">Mark as In Review</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responseNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional information about your decision..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit">
                Submit Response
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
