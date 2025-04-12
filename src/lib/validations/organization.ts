import { z } from 'zod';

export enum Industry {
  Technology = "Technology",
  Healthcare = "Healthcare",
  Finance = "Finance",
  Education = "Education",
  Manufacturing = "Manufacturing",
  Retail = "Retail",
  Other = "Other",
}

export enum OrganizationSize {
  XSmall = "1-10",
  Small = "11-50",
  Medium = "51-200",
  Large = "201-1000",
  XLarge = "1000+",
}

export enum OrganizationStructure {
  MultiTeam = "multi-team",
  SingleTeam = "single-team",
}

export enum UserRole {
  Admin = "admin",
  Manager = "manager",
  TeamLead = "team_lead",
}

export const organizationBasicInfoSchema = z.object({
  name: z.string().min(1, { message: "Organization name is required" }).max(100),
  industry: z.nativeEnum(Industry).default(Industry.Other),
  size: z.nativeEnum(OrganizationSize).default(OrganizationSize.XSmall),
  organizationStructure: z.nativeEnum(OrganizationStructure).default(OrganizationStructure.MultiTeam),
  teamCreationPermission: z.object({
    allowAnyUser: z.boolean().default(false),
    allowedRoles: z.array(z.nativeEnum(UserRole)).optional(),
  }).default({ allowAnyUser: false, allowedRoles: [UserRole.Admin] }),
}).strict();

export const organizationContactSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(1, { message: "Please enter a phone number" }),
  website: z.union([z.string().url({ message: "Please enter a valid URL" }), z.string().max(0)]).optional(),
}).strict();

export const organizationAddressSchema = z.object({
  streetAddress: z.string().min(3, { message: "Street address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
}).strict();

export const organizationCompleteSchema = organizationBasicInfoSchema
  .merge(organizationContactSchema)
  .merge(organizationAddressSchema);

// Types
export type OrganizationBasicInfo = z.infer<typeof organizationBasicInfoSchema>;
export type OrganizationContact = z.infer<typeof organizationContactSchema>;
export type OrganizationAddress = z.infer<typeof organizationAddressSchema>;
export type OrganizationComplete = z.infer<typeof organizationCompleteSchema>; 