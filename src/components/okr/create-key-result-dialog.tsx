"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import apiService from "@/lib/services/api";
import { Objective } from "@/lib/types/models/okr";
import { createKeyResultSchema } from "@/lib/validations/okr";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Task } from "@/lib/types/models/task";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface CreateKeyResultDialogProps {
  objective: Objective;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export function CreateKeyResultDialog({
  objective,
  open,
  onOpenChange,
  onCreate,
}: CreateKeyResultDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskWarning, setShowTaskWarning] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const apiCallInProgressRef = useRef(false);

  const form = useForm({
    resolver: zodResolver(createKeyResultSchema),
    defaultValues: {
      title: "",
      description: "",
      target: 100,
      current: 0,
      unit: "%",
      dueDate: objective?.dueDate ? dayjs(objective.dueDate).toISOString() : dayjs().add(1, "month").toISOString(),
      objectiveId: objective?._id,
      taskId: "none",
    },
  });

  useEffect(() => {
    const loadTasks = async () => {
      // Use ref to prevent duplicate API calls
      if (apiCallInProgressRef.current) return;
      
      try {
        // Only load tasks if dialog is open and tasks haven't been loaded yet
        if (open && !tasksLoaded && objective?.team) {
          apiCallInProgressRef.current = true;
          console.log("Loading tasks for create key result dialog");
          
          const teamId = typeof objective.team === 'object' ? objective.team._id : objective.team;
          // Load team tasks with a higher limit
          const response = await apiService.getTeamTasks(teamId, { 
            limit: 100
          });
          setTasks(response.data || []);
          setTasksLoaded(true);
          apiCallInProgressRef.current = false;
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        apiCallInProgressRef.current = false;
      }
    };
    
    loadTasks();
  }, [open, objective, tasksLoaded]);

  // Reset tasksLoaded when dialog closes
  useEffect(() => {
    if (!open) {
      setTasksLoaded(false);
      apiCallInProgressRef.current = false;
    }
  }, [open]);

  // Watch for task changes
  const watchedTaskId = form.watch("taskId");
  
  useEffect(() => {
    if (watchedTaskId && watchedTaskId !== "none") {
      const task = tasks.find(t => t._id === watchedTaskId);
      setSelectedTask(task || null);
      
      // Check if task due date is after key result due date
      const krDueDate = form.getValues("dueDate");
      if (task && krDueDate && dayjs(task.dueDate).isAfter(dayjs(krDueDate))) {
        setShowTaskWarning(true);
      } else {
        setShowTaskWarning(false);
      }
    } else {
      setSelectedTask(null);
      setShowTaskWarning(false);
    }
  }, [watchedTaskId, tasks, form]);

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      // Convert "none" to empty string for the API call
      const submissionData = {
        ...values,
        taskId: values.taskId === "none" ? "" : values.taskId
      };
      await apiService.createKeyResult(objective._id, submissionData);
      toast.success("Key result created successfully");
      form.reset();
      onOpenChange(false);
      onCreate();
    } catch (error: any) {
      toast.error(error.message || "Failed to create key result");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert tasks to options format for combobox
  const taskOptions = [
    { value: "none", label: "None" },
    ...tasks.map(task => ({
      value: task._id as string,
      label: task.title
    }))
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Key Result</DialogTitle>
          <DialogDescription>
            Add a new key result to track progress towards your objective.
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
                    <Input placeholder="Enter key result title" {...field} />
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
                      placeholder="Enter key result description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="%, users, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      disabledDate={(date) => 
                        dayjs(date).isBefore(dayjs(), "day") ||
                        (objective?.dueDate && dayjs(date).isAfter(dayjs(objective.dueDate)))
                      }
                      date={dayjs(field.value).toDate()}
                      onChange={(date) => field.onChange(date?.toISOString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Task (Optional)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={taskOptions}
                      value={field.value || "none"}
                      onChange={field.onChange}
                      placeholder="Search tasks..."
                      emptyText="No matching tasks found"
                      clearable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showTaskWarning && (
              <Alert className="bg-yellow-50 text-yellow-800 border border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  The selected task's due date is after this key result's due date, which may cause delays.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Key Result"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
