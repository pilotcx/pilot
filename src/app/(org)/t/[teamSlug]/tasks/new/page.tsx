"use client";

import {useTeam} from "@/components/providers/team-provider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowLeftIcon, CalendarIcon} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {CreateTaskInput, createTaskSchema} from "@/lib/validations/task";
import {TaskPriority} from "@/lib/types/models/task";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import Link from "next/link";
import {Project} from "@/lib/types/models/project";
import {TeamMember} from "@/lib/types/models/team";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {cn} from "@/lib/utils";

export default function NewTaskPage() {
  const {team} = useTeam();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  const [createTask, {loading: creatingTask}] = useApi(api.createTask);
  const [createProjectTask, {loading: creatingProjectTask}] = useApi(api.createProjectTask);
  const [getTeamProjects, {data: projectsData, loading: loadingProjects}] = useApi(api.getTeamProjects);
  const [getTeamMembers, {data: membersData, loading: loadingMembers}] = useApi(api.getTeamMembers);
  const [getProject, {data: projectData, loading: loadingProject}] = useApi(api.getProject);

  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch projects and members
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getTeamProjects(team._id as string);
        await getTeamMembers(team._id as string);

        // If a project ID is provided, fetch the project details
        if (projectId) {
          await getProject(projectId);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load data");
        console.error("Error fetching data:", error);
      }
    };

    if (team._id) {
      fetchData();
    }
  }, [team._id, projectId, getTeamProjects, getTeamMembers, getProject]);

  // Update state when data is loaded
  useEffect(() => {
    if (projectsData) {
      setProjects(projectsData);
    }
    if (membersData) {
      setMembers(membersData);
    }
  }, [projectsData, membersData]);

  // Set up form with default values
  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      priority: TaskPriority.Medium,
      project: projectId || "",
    },
    mode: "onChange",
  });

  // Update form when project data is loaded
  useEffect(() => {
    if (projectData) {
      form.setValue("project", projectData._id as string);
    }
  }, [projectData, form]);

  // Handle form submission
  async function onSubmit(values: CreateTaskInput) {
    try {
      if (projectId) {
        const project = projects.find(p => p._id === projectId);
        if (project) {
          await createProjectTask(team._id as string, project._id as string, values);
          toast.success("Task created successfully");
          router.push(`/t/${team.slug}/projects/${project.code}`);
          return;
        }
      }

      // Otherwise use the general task creation endpoint
      await createTask(team._id as string, values);
      toast.success("Task created successfully");

      // Navigate back to the project page if a project was selected
      const selectedProject = projects.find(p => p._id === values.project);
      if (selectedProject) {
        router.push(`/t/${team.slug}/projects/${selectedProject.code}`);
        return;
      }

      // Otherwise go to the tasks list
      router.push(`/t/${team.slug}/tasks`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
      console.error("Error creating task:", error);
    }
  }

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={projectId ? `/t/${team.slug}/projects/${projects.find(p => p._id === projectId)?.code || ''}` : `/t/${team.slug}/tasks`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4"/>
            {projectId ? 'Back to Project' : 'Back to Tasks'}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-muted-foreground">
            Add a new task to track work and assign it to team members
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Enter the information for your new task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, concise title for the task
                      </FormDescription>
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
                          placeholder="Describe what needs to be done"
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about the task requirements
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="project"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!!projectId || loadingProjects}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project._id as string} value={project._id as string}>
                                {project.code} - {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The project this task belongs to
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignee"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Assignee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to someone"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member._id as string} value={member._id as string}>
                                {member.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Who will be responsible for this task
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({field}) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the task should be completed
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={TaskPriority.Low.toString()}>Low</SelectItem>
                            <SelectItem value={TaskPriority.Medium.toString()}>Medium</SelectItem>
                            <SelectItem value={TaskPriority.High.toString()}>High</SelectItem>
                            <SelectItem value={TaskPriority.Urgent.toString()}>Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How important is this task
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={creatingTask || creatingProjectTask}>
                    {creatingTask || creatingProjectTask ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
