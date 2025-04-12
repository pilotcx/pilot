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
  organizationAddressSchema,
  type OrganizationAddress,
} from "@/lib/validations/organization";
import { useEffect } from "react";

type AddressStepProps = {
  data: OrganizationAddress;
  onUpdate: (data: OrganizationAddress) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function AddressStep({
  data,
  onUpdate,
  onSubmit,
  onBack,
  isSubmitting,
}: AddressStepProps) {
  const form = useForm<OrganizationAddress>({
    resolver: zodResolver(organizationAddressSchema),
    defaultValues: {
      address: data.address || "",
      state: data.state || "",
      postalCode: data.postalCode || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value as OrganizationAddress);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  function handleFormSubmit(values: OrganizationAddress) {
    onUpdate(values);
    onSubmit();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-6 items-start">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="94103" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Submitting..." : "Complete Setup"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
