"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { UpdateUserSchema, updateUserSchema } from "@/lib/validations/user";
import { AtSignIcon, CameraIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function GeneralSettingsPage() {
  const { profile, isLoading, isSubmitting, updateProfile } = useUserProfile();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );

  const defaultValues: Partial<UpdateUserSchema> = {
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    bio: "",
  };

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues,
    mode: "onChange",
  });

  const avatarUrl = form.watch("avatar");

  useEffect(() => {
    if (avatarUrl) {
      setAvatarPreview(avatarUrl);
    }
  }, [avatarUrl]);

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        avatar: profile.avatar || "",
        bio: profile.bio || "",
      });

      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    }
  }, [profile, form]);

  async function onSubmit(data: UpdateUserSchema) {
    try {
      await updateProfile(data);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  }

  const initials =
    form
      .watch("fullName")
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-none tracking-tight">
          Profile Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and how others see you on the
          platform
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avatar</CardTitle>
              <CardDescription>
                This will be displayed on your profile and in comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="text-xs font-normal">
                    <CameraIcon className="h-3 w-3 mr-1" />
                    Profile Picture
                  </Badge>
                </div>

                <div className="space-y-1 flex-1">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/avatar.png"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a URL to an image file to use as your profile
                          picture
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Your name"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSignIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            {...field}
                            disabled
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed after registration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (123) 456-7890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for important account notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
