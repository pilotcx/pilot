import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {Domain, DomainType, DomainVerificationStatus} from '@/lib/types/models/domain';
import {TeamRole} from '@/lib/types/models/team';
import {teamService} from '@/lib/services/team';

class DomainService {
  /**
   * Create a new domain for a team
   */
  async createDomain(teamId: string, domainData: Partial<Domain>, userId: string): Promise<Domain> {
    // Check if user has permission to manage domains
    const {membership} = await teamService.getTeamWithMembership(teamId, userId);
    if (!membership || ![TeamRole.Owner].includes(membership.role as TeamRole)) {
      throw new ApiError(403, 'You do not have permission to manage domains for this team');
    }

    // Normalize domain name
    const normalizedDomain = this.normalizeDomainName(domainData.name || '');
    if (!normalizedDomain) {
      throw new ApiError(400, 'Invalid domain name');
    }

    // Check if domain already exists for this team
    const existingDomain = await dbService.domain.findOne({
      team: teamId,
      name: normalizedDomain
    });

    if (existingDomain) {
      throw new ApiError(400, 'This domain is already registered for your team');
    }

    // Create domain - all domains are automatically verified
    const domain = await dbService.domain.create({
      name: normalizedDomain,
      team: teamId,
      type: domainData.type || DomainType.Manual,
      verificationStatus: DomainVerificationStatus.Verified,
      isActive: true
    });

    // Default domain functionality removed

    return domain;
  }

  /**
   * Get all domains for a team
   */
  async getTeamDomains(teamId: string, userId: string) {
    // Check if user has access to the team
    const {membership} = await teamService.getTeamWithMembership(teamId, userId);
    if (!membership) {
      throw new ApiError(403, 'You do not have access to this team');
    }

    // Get all domains for the team
    return await dbService.domain.find({team: teamId})
      .sort({isDefault: -1, createdAt: -1});
  }

  /**
   * Get a domain by ID
   */
  async getDomainById(domainId: string, userId: string): Promise<Domain> {
    const domain = await dbService.domain.findById(domainId);
    if (!domain) {
      throw new ApiError(404, 'Domain not found');
    }

    // Check if user has access to the team
    const {membership} = await teamService.getTeamWithMembership(domain.team.toString(), userId);
    if (!membership) {
      throw new ApiError(403, 'You do not have access to this domain');
    }

    return domain;
  }

  /**
   * Update a domain
   */
  async updateDomain(domainId: string, userId: string, updateData: Partial<Domain>): Promise<Domain> {
    const domain = await this.getDomainById(domainId, userId);

    // Check if user has permission to manage domains
    const {membership} = await teamService.getTeamWithMembership(domain.team.toString(), userId);
    if (!membership || ![TeamRole.Owner].includes(membership.role as TeamRole)) {
      throw new ApiError(403, 'You do not have permission to manage domains for this team');
    }

    // Prepare updates
    const updates: any = {};

    // Only allow updating certain fields
    const allowedUpdates = ['isActive'];
    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = (updateData as any)[key];
      }
    }

    // Update the domain
    const updatedDomain = await dbService.domain.updateOne(
      domainId,
      {$set: updates},
      {new: true}
    );

    // Default domain functionality removed

    return updatedDomain as Domain;
  }

  /**
   * Delete a domain
   */
  async deleteDomain(domainId: string, userId: string): Promise<void> {
    const domain = await this.getDomainById(domainId, userId);

    // Check if user has permission to manage domains
    const {membership} = await teamService.getTeamWithMembership(domain.team.toString(), userId);
    if (!membership || ![TeamRole.Owner].includes(membership.role as TeamRole)) {
      throw new ApiError(403, 'You do not have permission to manage domains for this team');
    }

    // Default domain functionality removed

    // Delete the domain
    await dbService.domain.delete({_id: domainId});
  }

  /**
   * Verify a domain - this is a no-op since verification is disabled
   * Kept for API compatibility
   */
  async verifyDomain(domainId: string, userId: string): Promise<Domain> {
    const domain = await this.getDomainById(domainId, userId);

    // Check if user has permission to manage domains
    const {membership} = await teamService.getTeamWithMembership(domain.team.toString(), userId);
    if (!membership || ![TeamRole.Owner].includes(membership.role as TeamRole)) {
      throw new ApiError(403, 'You do not have permission to manage domains for this team');
    }

    // All domains are automatically verified
    return domain;
  }

  /**
   * Set a domain as the default for a team
   */
  async setDefaultDomain(domainId: string, userId: string): Promise<Domain> {
    const domain = await this.getDomainById(domainId, userId);

    // Check if user has permission to manage domains
    const {membership} = await teamService.getTeamWithMembership(domain.team.toString(), userId);
    if (!membership || ![TeamRole.Owner].includes(membership.role as TeamRole)) {
      throw new ApiError(403, 'You do not have permission to manage domains for this team');
    }

    // All domains are automatically verified, so no need to check verification status

    // Update all other domains to not be default
    await this.updateDefaultDomain(domain.team.toString(), domainId);

    // Set this domain as default
    const updatedDomain = await dbService.domain.updateOne(
      domainId,
      {$set: {isDefault: true}},
      {new: true}
    );

    return updatedDomain as Domain;
  }

  /**
   * Get the default domain for a team
   */
  async getDefaultDomain(teamId: string): Promise<Domain | null> {
    return await dbService.domain.findOne({
      team: teamId,
      isDefault: true,
      isActive: true,
      verificationStatus: DomainVerificationStatus.Verified
    });
  }

  /**
   * Get verification instructions for a domain
   * This is a no-op since verification is disabled
   */
  getVerificationInstructions(domain: Domain): { type: string, value: string, instructions: string } {
    // Verification is disabled, but return a placeholder for API compatibility
    return {
      type: 'None',
      value: 'Verification disabled',
      instructions: 'Domain verification is disabled. All domains are automatically verified.'
    };
  }

  // Private methods

  // Default domain functionality removed

  /**
   * Normalize a domain name
   */
  private normalizeDomainName(domain: string): string {
    // Remove protocol and path
    let normalizedDomain = domain.trim().toLowerCase();
    normalizedDomain = normalizedDomain.replace(/^(https?:\/\/)?(www\.)?/i, '');
    normalizedDomain = normalizedDomain.split('/')[0];

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(normalizedDomain)) {
      return '';
    }

    return normalizedDomain;
  }

  // Verification methods removed since verification is disabled
}

export const domainService = new DomainService();
