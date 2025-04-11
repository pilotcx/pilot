import { z } from 'zod';

// Step 1: Basic Information
export const organizationBasicInfoSchema = z.object({
  name: z.string().min(3, { message: "Organization name must be at least 3 characters" }).max(100),
  industry: z.string().min(1, { message: "Please select an industry" }),
  size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    required_error: "Please select organization size",
  }),
}).strict();

// Step 2: Contact Information
export const organizationContactSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().regex(/^\d{10,15}$/, { message: "Please enter a valid phone number" }),
  website: z.string().url({ message: "Please enter a valid URL" }).optional(),
}).strict();

// Step 3: Address
export const organizationAddressSchema = z.object({
  streetAddress: z.string().min(3, { message: "Street address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
}).strict();

// Complete organization schema combining all steps
export const organizationCompleteSchema = organizationBasicInfoSchema
  .merge(organizationContactSchema)
  .merge(organizationAddressSchema);

// Types
export type OrganizationBasicInfo = z.infer<typeof organizationBasicInfoSchema>;
export type OrganizationContact = z.infer<typeof organizationContactSchema>;
export type OrganizationAddress = z.infer<typeof organizationAddressSchema>;
export type OrganizationComplete = z.infer<typeof organizationCompleteSchema>; 