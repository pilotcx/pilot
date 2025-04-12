import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrganizationSize } from "./validations/organization";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatSizeLabel = (size: string): string => {
  switch(size) {
    case OrganizationSize.XSmall: return "1-10 employees";
    case OrganizationSize.Small: return "11-50 employees";
    case OrganizationSize.Medium: return "51-200 employees";
    case OrganizationSize.Large: return "201-1000 employees";
    case OrganizationSize.XLarge: return "1000+ employees";
    default: return size;
  }
};

export const formatRoleLabel = (role: string): string => {
  return role.replace('_', ' ');
};