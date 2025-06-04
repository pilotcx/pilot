"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createObjectiveSchema } from "@/lib/validations/okr";
import apiService from "@/lib/services/api";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import dayjs from "dayjs";

interface CreateObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export function CreateObjectiveDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateObjectiveDialogProps) {
  const { team } = useTeam();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createObjectiveSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: dayjs().add(1, "month").toISOString(),
      teamId: team?._id as string,
    },
  });

  const onSubmit = async (data: any) => {
    if (!team?._id) return;

    try {
      setIsSubmitting(true);
      await apiService.createObjective(team._id as string, data);
      toast.success("Objective created successfully");
      form.reset();
      onOpenChange(false);
      onCreate();
    } catch (error: any) {
      toast.error(error.message || "Failed to create objective");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Objective</DialogTitle>
          <DialogDescription>
            Add a new objective for your team. Make it specific, measurable, and
            time-bound.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter objective title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter objective description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      disabledDate={(date) => dayjs(date).isBefore(dayjs(), "day")}
                      date={dayjs(field.value).toDate()}
                      onChange={(date) => field.onChange(date?.toISOString())}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Objective"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 