import { BaseEntity } from "@/lib/types/models/base";
import { TeamMember } from "@/lib/types/models/team";
import { Domain } from "@/lib/types/models/domain";
import mongoose from "mongoose";

/**
 * Email address status
 */
export enum EmailAddressStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

/**
 * Email address type
 */
export enum EmailAddressType {
  Primary = 'primary',
  Alias = 'alias'
}

/**
 * Email address interface
 */
export interface EmailAddress extends BaseEntity {
  /**
   * The local part of the email address (before the @)
   */
  localPart: string;

  /**
   * The domain associated with this email address
   */
  domain: string | mongoose.Types.ObjectId | Domain;

  /**
   * The team member who owns this email address
   */
  teamMember: string | mongoose.Types.ObjectId | TeamMember;

  /**
   * The full email address (localPart@domain.name)
   */
  fullAddress?: string;

  /**
   * The display name to show for this email address
   */
  displayName?: string;

  /**
   * The status of this email address
   */
  status: EmailAddressStatus;

  /**
   * The type of email address
   */
  type: EmailAddressType;

  /**
   * Whether this is the default email address for the user
   */
  isDefault: boolean;
}
