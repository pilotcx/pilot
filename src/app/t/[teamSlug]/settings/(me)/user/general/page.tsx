"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const userProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().optional(),
  avatar: z.string().url({ message: "Please enter a valid URL" }).optional(),
  bio: z.string().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export default function GeneralSettingsPage() {
  const { profile, isLoading, isSubmitting, updateProfile } = useUserProfile();
  
  const defaultValues: Partial<UserProfileFormValues> = {
    fullName: "",
    email: "",
    phoneNumber: "",
    avatar: "",
    bio: "",
  };

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues,
    mode: "onChange",
  });

  const avatarUrl = form.watch("avatar");
  console.log(avatarUrl);

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        avatar: profile.avatar || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, form]);

  async function onSubmit(data: UserProfileFormValues) {
    await updateProfile(data);
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Change your general settings to protect your account.
        </p>
      </div>

      <section className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xl">
              {form.watch("fullName")?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">Profile Picture</p>
        </div>

        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
