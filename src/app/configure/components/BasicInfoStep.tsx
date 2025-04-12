"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  organizationBasicInfoSchema,
  type OrganizationBasicInfo,
} from "@/lib/validations/organization";
import { useEffect, useState } from "react";

type BasicInfoStepProps = {
  data: OrganizationBasicInfo;
  onUpdate: (data: OrganizationBasicInfo) => void;
  onNext: () => void;
};

export function BasicInfoStep({ data, onUpdate, onNext }: BasicInfoStepProps) {
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Other'
  ];
  
  const sizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
  
  // Use simpler form state management
  const [formState, setFormState] = useState({
    name: data.name || "",
    industry: data.industry || "Other",
    size: data.size || "1-10"
  });
  
  useEffect(() => {
    setFormState({
      name: data.name || "",
      industry: data.industry || "Other",
      size: data.size || "1-10"
    });
  }, [data]);
  
  const handleChange = (field: string, value: string) => {
    const newState = { ...formState, [field]: value };
    setFormState(newState);
    onUpdate(newState);
  };
  
  const handleContinue = () => {
    // Always save current form state before proceeding
    onUpdate(formState);
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Organization Name
        </label>
        <Input 
          id="name" 
          value={formState.name} 
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Acme Inc." 
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="industry" className="text-sm font-medium">
          Industry
        </label>
        <Select 
          value={formState.industry} 
          onValueChange={(value) => handleChange('industry', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="size" className="text-sm font-medium">
          Organization Size
        </label>
        <Select 
          value={formState.size} 
          onValueChange={(value) => handleChange('size', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size} employees
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Button type="button" onClick={handleContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
} 