"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { User } from "@/lib/types/models/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Define the form schema
const adminSettingsFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

type AdminSettingsFormValues = z.infer<typeof adminSettingsFormSchema>;

interface AdminSettingsFormProps {
  initialData: User;
}

export function AdminSettingsForm({ initialData }: AdminSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<AdminSettingsFormValues>({
    resolver: zodResolver(adminSettingsFormSchema),
    defaultValues: {
      fullName: initialData.fullName || "",
      email: initialData.email || "",
      phoneNumber: initialData.phoneNumber || "",
      bio: initialData.bio || "",
      avatar: initialData.avatar || "",
    },
  });

  async function onSubmit(values: AdminSettingsFormValues) {
    setIsSubmitting(true);
    
    try {
      // Submit the form data to the API
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={initialData.avatar || ""} alt={initialData.fullName} />
            <AvatarFallback className="text-lg">
              {initialData.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-lg font-medium">{initialData.fullName}</h3>
            <p className="text-sm text-muted-foreground">{initialData.email}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
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
                <Input placeholder="Enter your phone number" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Optional contact number for account recovery
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
                  className="resize-none" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A brief description about yourself
              </FormDescription>
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
                <Input placeholder="Enter avatar URL" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                URL to your profile picture
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
