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
import { KeyResult, KeyResultStatus, Objective } from "@/lib/types/models/okr";
import { updateKeyResultSchema } from "@/lib/validations/okr";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Task } from "@/lib/types/models/task";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface EditKeyResultDialogProps {
  keyResult: KeyResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EditKeyResultDialog({
  keyResult,
  open,
  onOpenChange,
  onUpdate,
}: EditKeyResultDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskWarning, setShowTaskWarning] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const apiCallInProgressRef = useRef(false);

  const form = useForm({
    resolver: zodResolver(updateKeyResultSchema),
    defaultValues: {
      title: keyResult.title,
      description: keyResult.description || "",
      status: keyResult.status,
      progress: keyResult.progress,
      target: keyResult.target,
      current: keyResult.current,
      unit: keyResult.unit,
      dueDate: dayjs(keyResult.dueDate).toISOString(),
      taskId: keyResult.task ? (typeof keyResult.task === 'string' ? keyResult.task : keyResult.task._id as string) : "none",
    },
  });

  // Load tasks only once when the dialog opens and tasks haven't been loaded yet
  useEffect(() => {
    const loadTasks = async () => {
      // Use ref to prevent duplicate API calls
      if (apiCallInProgressRef.current) return;
      
      try {
        // Only load tasks if dialog is open and tasks haven't been loaded yet
        if (open && !tasksLoaded && keyResult?.objective) {
          apiCallInProgressRef.current = true;
          console.log("Loading tasks for edit key result dialog");
          
          const objective = keyResult.objective as Objective;
          const teamId = typeof objective.team === 'object' ? objective.team._id : objective.team;
          
          // Load team tasks with a higher limit (100 instead of 10)
          const response = await apiService.getTeamTasks(teamId, { 
            limit: 100
          });
          setTasks(response.data || []);
          
          // Mark tasks as loaded
          setTasksLoaded(true);
          
          // Check if there's already a task with warning
          if (keyResult.task) {
            const taskId = typeof keyResult.task === 'string' ? keyResult.task : keyResult.task._id;
            const task = response.data.find((t: Task) => t._id === taskId);
            
            if (task && dayjs(task.dueDate).isAfter(dayjs(keyResult.dueDate))) {
              setShowTaskWarning(true);
            }
          }
          
          apiCallInProgressRef.current = false;
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        apiCallInProgressRef.current = false;
      }
    };
    
    loadTasks();
  }, [open, tasksLoaded, keyResult]);

  // Reset the tasksLoaded state when dialog closes
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
      await apiService.updateKeyResult(keyResult._id, submissionData);
      toast.success("Key result updated successfully");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update key result");
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
          <DialogTitle>Edit Key Result</DialogTitle>
          <DialogDescription>
            Update the details of your key result.
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(KeyResultStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseInt(value, 10));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseFloat(value));
                        }}
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
                      <Input {...field} />
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
                      disabledDate={(date) => dayjs(date).isBefore(dayjs(), "day")}
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
                {isSubmitting ? "Updating..." : "Update Key Result"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
