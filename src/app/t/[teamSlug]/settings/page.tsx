"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {updateTeamSchema, type UpdateTeamSchema} from "@/lib/validations/team";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Separator} from "@/components/ui/separator";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {slugify} from "@/lib/utils/slugify";
import {AlertCircle} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {useTeam} from "@/components/providers/team-provider";

export default function GeneralSettings() {
  const params = useParams<{ teamSlug: string }>();
  const router = useRouter();
  const [updateTeam, {loading: updating}] = useApi(api.updateTeam);
  const [deleteTeam, {loading: deleting}] = useApi(api.deleteTeam);
  const {team} = useTeam();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<UpdateTeamSchema>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      name: team.name,
      slug: team.slug,
      description: team.description || "",
    });
  }, [team, form]);

  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (name === "name") {
        const nameValue = value.name as string;
        const currentSlug = form.getValues("slug");

        // Only update slug if it matches the original team slug or is empty
        if (currentSlug === team?.slug || !currentSlug) {
          if (nameValue) {
            const generatedSlug = slugify(nameValue);
            form.setValue("slug", generatedSlug, {shouldValidate: true});
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, team]);

  async function onSubmit(values: UpdateTeamSchema) {
    try {
      if (!team) return;

      await updateTeam(team._id as string, values);
      toast.success("Team settings updated successfully");

      if (values.slug !== team.slug) {
        router.push(`/t/${values.slug}/settings`);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update team settings");
    }
  }

  async function handleDeleteTeam() {
    try {
      if (!team) return;

      await deleteTeam(team._id as string);
      toast.success("Team deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your team information and preferences
        </p>
      </div>

      <Separator/>

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
            <Button type="submit" disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      <Separator/>

      <div>
        <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete this team and all of its data
        </p>

        <div className="mt-4">
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. This will permanently delete the team and all associated data.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={handleDeleteTeam}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Team"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
