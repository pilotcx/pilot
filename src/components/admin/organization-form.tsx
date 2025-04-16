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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Industry, OrganizationSize, OrganizationStructure } from "@/lib/validations/organization";
import { SystemConfigKey } from "@/lib/types/models/system-config";

// Define the form schema
const organizationFormSchema = z.object({
  [SystemConfigKey.OrgName]: z.string().min(1, "Organization name is required"),
  [SystemConfigKey.OrgDesc]: z.string().optional(),
  [SystemConfigKey.OrgIndustry]: z.nativeEnum(Industry),
  [SystemConfigKey.OrgSize]: z.nativeEnum(OrganizationSize),
  [SystemConfigKey.OrgStructure]: z.nativeEnum(OrganizationStructure),
  [SystemConfigKey.OrgAllowRegistration]: z.boolean().default(false),
  [SystemConfigKey.OrgEmail]: z.string().email("Invalid email address"),
  [SystemConfigKey.OrgPhone]: z.string().optional(),
  [SystemConfigKey.OrgWebsite]: z.string().optional(),
  [SystemConfigKey.OrgAddress]: z.string().optional(),
  [SystemConfigKey.OrgState]: z.string().optional(),
  [SystemConfigKey.OrgPostalCode]: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface OrganizationFormProps {
  initialData: Partial<OrganizationFormValues>;
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      [SystemConfigKey.OrgName]: initialData[SystemConfigKey.OrgName] as string || "",
      [SystemConfigKey.OrgDesc]: initialData[SystemConfigKey.OrgDesc] as string || "",
      [SystemConfigKey.OrgIndustry]: (initialData[SystemConfigKey.OrgIndustry] as Industry) || Industry.Technology,
      [SystemConfigKey.OrgSize]: (initialData[SystemConfigKey.OrgSize] as OrganizationSize) || OrganizationSize.XSmall,
      [SystemConfigKey.OrgStructure]: (initialData[SystemConfigKey.OrgStructure] as OrganizationStructure) || OrganizationStructure.MultiTeam,
      [SystemConfigKey.OrgAllowRegistration]: initialData[SystemConfigKey.OrgAllowRegistration] as boolean || false,
      [SystemConfigKey.OrgEmail]: initialData[SystemConfigKey.OrgEmail] as string || "",
      [SystemConfigKey.OrgPhone]: initialData[SystemConfigKey.OrgPhone] as string || "",
      [SystemConfigKey.OrgWebsite]: initialData[SystemConfigKey.OrgWebsite] as string || "",
      [SystemConfigKey.OrgAddress]: initialData[SystemConfigKey.OrgAddress] as string || "",
      [SystemConfigKey.OrgState]: initialData[SystemConfigKey.OrgState] as string || "",
      [SystemConfigKey.OrgPostalCode]: initialData[SystemConfigKey.OrgPostalCode] as string || "",
    },
  });

  async function onSubmit(values: OrganizationFormValues) {
    setIsSubmitting(true);
    
    try {
      // Submit the form data to the API
      const response = await fetch('/api/admin/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update organization settings');
      }
      
      toast.success("Organization settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization settings");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgEmail}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name={SystemConfigKey.OrgDesc}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter organization description" 
                  className="resize-none" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                A brief description of your organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgIndustry}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Industry).map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgSize}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Size</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(OrganizationSize).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgStructure}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Structure</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select structure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(OrganizationStructure).map((structure) => (
                      <SelectItem key={structure} value={structure}>
                        {structure === OrganizationStructure.MultiTeam ? "Multi-Team" : "Single Team"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgPhone}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgWebsite}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="Enter website URL" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={SystemConfigKey.OrgPostalCode}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name={SystemConfigKey.OrgAddress}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={SystemConfigKey.OrgState}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input placeholder="Enter state or province" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name={SystemConfigKey.OrgAllowRegistration}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow Public Registration</FormLabel>
                <FormDescription>
                  When enabled, users can register accounts without an invitation
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
