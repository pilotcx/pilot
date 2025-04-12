"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createTeamSchema, type CreateTeamSchema} from "@/lib/validations/team";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {slugify} from "@/lib/utils/slugify";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ArrowLeft} from "lucide-react";
import api from "@/lib/services/api";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";

export function CreateTeamForm() {
  const router = useRouter();
  const [createTeam, { loading }] = useApi(api.createTeam);

  const form = useForm<CreateTeamSchema>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
    mode: "onChange",
  });

  // Generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (name === "name") {
        const nameValue = value.name as string;
        if (nameValue) {
          const generatedSlug = slugify(nameValue);
          // Only update slug if user hasn't manually changed it
          if (!form.getValues("slug")) {
            form.setValue("slug", generatedSlug, {shouldValidate: true});
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: CreateTeamSchema) {
    try {
      const response = await createTeam(values);
      toast.success("Team created successfully!");

      // Navigate to the new team page using the slug
      const teamSlug = response.data.slug;
      router.push(`/t/${teamSlug}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
      console.error("Error creating team:", error);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 h-8 w-8 p-0"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4"/>
            <span className="sr-only">Back</span>
          </Button>
          <CardTitle>Create a New Team</CardTitle>
        </div>
        <CardDescription>
          Set up a new team and start collaborating with your colleagues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed to all team members.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Team URL</FormLabel>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">/t/</div>
                    <FormControl>
                      <Input placeholder="team-name" {...field} />
                    </FormControl>
                  </div>
                  <FormDescription>
                    This is the URL that will be used to access your team. Only lowercase letters, numbers, and hyphens
                    are allowed.
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
                      placeholder="Describe the purpose of this team"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this team does.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
