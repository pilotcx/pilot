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

// Admin account schema for the first step
export const adminAccountSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).strict().refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const organizationBasicInfoSchema = z.object({
  name: z.string().min(1, { message: "Organization name is required" }).max(100),
  description: z.string().optional(),
  industry: z.nativeEnum(Industry).default(Industry.Other),
  size: z.nativeEnum(OrganizationSize).default(OrganizationSize.XSmall),
  organizationStructure: z.nativeEnum(OrganizationStructure).default(OrganizationStructure.MultiTeam),
  avatar: z.string().optional(),
  allowRegistration: z.boolean().default(false),
  teamCreationPermission: z.object({
    allowAnyUser: z.boolean().default(false),
    allowedRoles: z.array(z.nativeEnum(UserRole)).optional(),
  }).default({ allowAnyUser: false, allowedRoles: [UserRole.Admin] }),
}).strict();

export const organizationContactSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  website: z.union([z.string().url({ message: "Please enter a valid URL" }), z.string().max(0)]).optional(),
}).strict();

export const organizationAddressSchema = z.object({
  address: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
}).strict();

export const organizationCompleteSchema = organizationBasicInfoSchema
  .merge(organizationContactSchema)
  .merge(organizationAddressSchema);

// Combined schema for the entire organization setup
export const organizationSetupSchema = z.object({
  adminAccount: adminAccountSchema,
  organization: organizationCompleteSchema,
}).strict();

// Types
export type AdminAccount = z.infer<typeof adminAccountSchema>;
export type OrganizationBasicInfo = z.infer<typeof organizationBasicInfoSchema>;
export type OrganizationContact = z.infer<typeof organizationContactSchema>;
export type OrganizationAddress = z.infer<typeof organizationAddressSchema>;
export type OrganizationComplete = z.infer<typeof organizationCompleteSchema>;
export type OrganizationSetup = z.infer<typeof organizationSetupSchema>;
