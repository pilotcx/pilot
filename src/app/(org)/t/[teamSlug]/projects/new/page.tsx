"use client";

import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {
  CreateProjectInput,
  createProjectSchema,
} from "@/lib/validations/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewProjectPage() {
  const { team, reloadProjects } = useTeam();
  const router = useRouter();
  const [createProject, { loading }] = useApi(api.createProject);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      team: team._id as string,
    },
    mode: "onChange",
  });

  async function onSubmit(values: CreateProjectInput) {
    try {
      await createProject(team._id as string, values);
      toast.success("Project created successfully");
      await reloadProjects?.();
      router.push(`/t/${team.slug}/projects`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
      console.error("Error creating project:", error);
    }
  }

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/t/${team.slug}/projects`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Set up a new project for your team to organize tasks and track
            progress
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed to all team
                        members.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="PROJ"
                          {...field}
                          value={field.value?.toUpperCase()}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          maxLength={10}
                        />
                      </FormControl>
                      <FormDescription>
                        A short, unique identifier for the project (e.g., PROJ,
                        HR, MARK). Use only uppercase letters and numbers.
                      </FormDescription>
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
                          placeholder="Describe the purpose of this project"
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of what this project is about.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Project"}
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
