"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  organizationContactSchema,
  type OrganizationContact,
} from "@/lib/validations/organization";
import { useEffect } from "react";

type ContactInfoStepProps = {
  data: OrganizationContact;
  onUpdate: (data: OrganizationContact) => void;
  onNext: () => void;
  onBack: () => void;
};

export function ContactInfoStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ContactInfoStepProps) {
  const form = useForm<OrganizationContact>({
    resolver: zodResolver(organizationContactSchema),
    defaultValues: {
      email: data.email || "",
      phone: data.phone || "",
      website: data.website || "",
    },
    mode: "onChange"
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value as OrganizationContact);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);
  
  function onSubmit(values: OrganizationContact) {
    onUpdate(values);
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@acmeinc.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="1234567890"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://acmeinc.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
