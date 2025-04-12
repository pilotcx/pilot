"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatRoleLabel, formatSizeLabel } from "@/lib/utils";
import {
  organizationBasicInfoSchema,
  type OrganizationBasicInfo,
  Industry,
  OrganizationSize,
  OrganizationStructure,
  UserRole,
} from "@/lib/validations/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type BasicInfoStepProps = {
  data: OrganizationBasicInfo;
  onUpdate: (data: OrganizationBasicInfo) => void;
  onNext: () => void;
};

export function BasicInfoStep({ data, onUpdate, onNext }: BasicInfoStepProps) {
  const form = useForm({
    resolver: zodResolver(organizationBasicInfoSchema),
    defaultValues: {
      name: data.name || "",
      industry: data.industry || Industry.Other,
      size: data.size || OrganizationSize.XSmall,
      organizationStructure:
        data.organizationStructure || OrganizationStructure.MultiTeam,
      teamCreationPermission: data.teamCreationPermission || {
        allowAnyUser: false,
        allowedRoles: [UserRole.Admin],
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate(value as OrganizationBasicInfo);
    });
    return () => subscription.unsubscribe();
  }, [form, onUpdate]);

  function onSubmit(values: OrganizationBasicInfo) {
    onUpdate(values);
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Organization Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Industry" />
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
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Size</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(OrganizationSize).map((size) => (
                      <SelectItem key={size} value={size}>
                        {formatSizeLabel(size)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="organizationStructure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Structure</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Organization Structure" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={OrganizationStructure.MultiTeam}>
                    Multi-team
                  </SelectItem>
                  <SelectItem value={OrganizationStructure.SingleTeam}>
                    Single-team
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Multi-team allows multiple teams to be created. Single-team uses
                only one default team.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teamCreationPermission.allowAnyUser"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Team Creation Permission</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowAnyUser"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="allowAnyUser">
                    Allow any user to create teams
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!form.watch("teamCreationPermission.allowAnyUser") && (
          <div className="space-y-2 ml-6">
            <p className="text-sm text-gray-600">
              Select roles that can create teams:
            </p>
            <div className="space-y-2">
              {Object.values(UserRole).map((role) => (
                <FormField
                  key={role}
                  control={form.control}
                  name="teamCreationPermission.allowedRoles"
                  render={() => {
                    const allowedRoles =
                      form.watch("teamCreationPermission.allowedRoles") || [];
                    const isChecked = allowedRoles.includes(role);

                    return (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            id={`role-${role}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue(
                                  "teamCreationPermission.allowedRoles",
                                  [...allowedRoles, role],
                                  { shouldValidate: true }
                                );
                              } else {
                                form.setValue(
                                  "teamCreationPermission.allowedRoles",
                                  allowedRoles.filter((r) => r !== role),
                                  { shouldValidate: true }
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <label
                          htmlFor={`role-${role}`}
                          className="text-sm font-medium capitalize"
                        >
                          {formatRoleLabel(role)}
                        </label>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
