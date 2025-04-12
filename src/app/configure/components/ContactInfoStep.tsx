"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  organizationContactSchema,
  type OrganizationContact,
} from "@/lib/validations/organization";
import { useState } from "react";
import { z } from "zod";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...data, [name]: value });
  };

  const handleSkip = () => {
    onUpdate({
      ...data,
      email: data.email || "contact@example.com",
      phone: data.phone || "0000000000",
    });
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const modifiedContactSchema = z.object({
        email: z.string().email({ message: "Please enter a valid email address" }),
        phone: z.string().min(1, { message: "Please enter a phone number" }),
        website: z.union([z.string().url(), z.string().max(0)]).optional(),
      });
      
      const result = modifiedContactSchema.safeParse(data);
      
      if (result.success) {
        setErrors({});
        onNext();
      } else {
        const formattedErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
    } catch (error) {
      console.error("Contact form validation error:", error);
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
        <Label htmlFor="email">Contact Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={data.email || ""}
          onChange={handleChange}
          placeholder="contact@acmeinc.com"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={data.phone || ""}
          onChange={handleChange}
          placeholder="1234567890"
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          name="website"
          type="url"
          value={data.website || ""}
          onChange={handleChange}
          placeholder="https://acmeinc.com"
        />
        {errors.website && (
          <p className="text-sm text-red-500">{errors.website}</p>
        )}
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
        <Button type="submit" className="flex-1">
          Continue
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={handleSkip} 
          className="flex-none"
        >
          Skip
        </Button>
      </div>
    </form>
  );
}
