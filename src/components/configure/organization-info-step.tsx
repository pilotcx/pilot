"use client";

import {useForm} from "react-hook-form";
import {useState, useEffect} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Industry,
  organizationAddressSchema,
  organizationBasicInfoSchema,
  organizationContactSchema,
  OrganizationSize,
  OrganizationStructure,
  UserRole
} from "@/lib/validations/organization";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Separator} from "@/components/ui/separator";

interface OrganizationInfoStepProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function OrganizationInfoStep({
                                       defaultValues,
                                       onSubmit,
                                       isSubmitting = false
                                     }: OrganizationInfoStepProps) {
  // Add a ref to track if the form has been mounted
  const [formMounted, setFormMounted] = useState(false);
  // Create a combined schema for the form
  const combinedSchema = organizationBasicInfoSchema
    .merge(organizationContactSchema)
    .merge(organizationAddressSchema);

  const form = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: defaultValues || {
      name: "",
      industry: Industry.Other,
      size: OrganizationSize.XSmall,
      organizationStructure: OrganizationStructure.MultiTeam,
      allowRegistration: false,
      teamCreationPermission: {
        allowAnyUser: false,
        allowedRoles: [UserRole.Admin],
      },
      email: "",
      phone: "",
      website: "",
      address: "",
      state: "",
      postalCode: "",
    },
    mode: "onChange",
  });

  // Handle autofill by checking input values after the component mounts
  useEffect(() => {
    // Wait for the component to fully mount
    setFormMounted(true);

    // Use a timeout to allow browser autofill to complete
    const timeoutId = setTimeout(() => {
      // Get all input elements in the form
      const formElement = document.querySelector('form');
      if (formElement) {
        const inputs = formElement.querySelectorAll('input, textarea, select');

        // Check each input for autofilled values
        inputs.forEach((input) => {
          const name = (input as HTMLInputElement).name;
          if (name && input instanceof HTMLInputElement) {
            // If the input has a value but the form state doesn't, update the form
            const currentValue = form.getValues(name);
            if (input.value && (!currentValue || currentValue === '')) {
              form.setValue(name, input.value, { shouldValidate: true, shouldDirty: true });
            }
          }
        });
      }
    }, 500); // 500ms delay should be enough for autofill

    return () => clearTimeout(timeoutId);
  }, [form]);

  return (
    <div>
      <div className='mb-4'>
        <div className="text-2xl font-semibold">Organization Information</div>
        <div className={'text-sm text-muted-foreground'}>
          Provide details about your organization to customize your experience.
        </div>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Corporation"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your organization as it will appear throughout the system.
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={'w-full'}>
                              <SelectValue placeholder="Select industry"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(Industry).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary industry your organization operates in.
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Organization Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={'w-full'}>
                              <SelectValue placeholder="Select size"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(OrganizationSize).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The approximate number of employees in your organization.
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="organizationStructure"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Organization Structure</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Select structure"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OrganizationStructure.SingleTeam}>
                            Single Team
                          </SelectItem>
                          <SelectItem value={OrganizationStructure.MultiTeam}>
                            Multiple Teams
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How your organization is structured for collaboration.
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowRegistration"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow User Registration
                        </FormLabel>
                        <FormDescription>
                          Allow new users to register with your organization.
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

                <FormField
                  control={form.control}
                  name="teamCreationPermission.allowAnyUser"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow Team Creation
                        </FormLabel>
                        <FormDescription>
                          Allow any user to create new teams.
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
              </div>
            </div>

            <Separator/>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The primary contact email for your organization.
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional contact phone number.
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your organization's website URL.
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator/>

            {/* Address Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address (Optional)</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, Suite 100" {...field} />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="California" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="94103" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
