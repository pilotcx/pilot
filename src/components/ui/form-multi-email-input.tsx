"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { MultiEmailInput } from "@/components/ui/multi-email-input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface FormMultiEmailInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function FormMultiEmailInput({
  name,
  label,
  placeholder,
  disabled,
  className,
}: FormMultiEmailInputProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <MultiEmailInput
              value={field.value || []}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
