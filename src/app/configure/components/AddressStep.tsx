"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  organizationAddressSchema,
  type OrganizationAddress,
} from "@/lib/validations/organization";
import { useState } from "react";
import { z } from "zod";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use safeParse for consistent validation approach
      const result = organizationAddressSchema.safeParse(data);
      
      if (result.success) {
        setErrors({});
        onSubmit();
      } else {
        // Format validation errors
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    } catch (error) {
      console.error("Address form validation error:", error);
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input
          id="streetAddress"
          name="streetAddress"
          value={data.streetAddress || ""}
          onChange={handleChange}
          placeholder="123 Main St"
        />
        {errors.streetAddress && (
          <p className="text-sm text-red-500">{errors.streetAddress}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={data.city || ""}
            onChange={handleChange}
            placeholder="San Francisco"
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            name="state"
            value={data.state || ""}
            onChange={handleChange}
            placeholder="CA"
          />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={data.postalCode || ""}
            onChange={handleChange}
            placeholder="94103"
          />
          {errors.postalCode && (
            <p className="text-sm text-red-500">{errors.postalCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={data.country || ""}
            onChange={handleChange}
            placeholder="United States"
          />
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country}</p>
          )}
        </div>
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
  );
}
