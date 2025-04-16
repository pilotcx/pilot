import {BaseEntity} from "@/lib/types/models/base";
import {Integration} from "@/lib/types/models/integration";
import {Team} from "@/lib/types/models/team";
import mongoose from "mongoose";

/**
 * Domain verification status - all domains are automatically verified
 */
export enum DomainVerificationStatus {
  Verified = 'verified'
}

/**
 * Domain type
 */
export enum DomainType {
  Integration = 'integration',
  Manual = 'manual',
  Primary = 'primary',
  Secondary = 'secondary'
}

/**
 * Domain interface
 */
export interface Domain extends BaseEntity {
  /**
   * The domain name (e.g., example.com)
   */
  name: string;

  /**
   * The team that owns this domain
   */
  team: string | mongoose.Types.ObjectId | Team;

  /**
   * Optional integration that this domain is associated with
   */
  integration?: string | mongoose.Types.ObjectId | Integration;

  /**
   * Domain type
   */
  type: DomainType;

  /**
   * Domain verification status - always verified
   */
  verificationStatus?: DomainVerificationStatus;

  // Default domain functionality removed

  /**
   * Whether the domain is active
   */
  isActive?: boolean;
}
