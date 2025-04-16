import { dbService } from '@/lib/db/service';
import { ApiError } from '@/lib/types/errors/api.error';
import { EmailAddress, EmailAddressStatus, EmailAddressType } from '@/lib/types/models/email-address';
import { Domain } from '@/lib/types/models/domain';

import { TeamRole } from '@/lib/types/models/team';
import { teamService } from '@/lib/services/team';

class EmailAddressService {
  /**
   * Create a new email address for a team member
   */
  async createEmailAddress(
    teamId: string,
    teamMemberId: string,
    localPart: string,
    domainId: string,
    displayName?: string,
    type: EmailAddressType = EmailAddressType.Alias,
    isDefault: boolean = false
  ): Promise<EmailAddress> {
    await dbService.connect();

    // Validate local part
    if (!this.isValidLocalPart(localPart)) {
      throw new ApiError(400, 'Invalid local part. Only letters, numbers, dots, hyphens, and underscores are allowed.');
    }

    // Check if domain exists
    const domain = await dbService.domain.findById(domainId);
    if (!domain) {
      throw new ApiError(404, 'Domain not found');
    }

    // Check if domain belongs to the team
    if (domain.team.toString() !== teamId) {
      throw new ApiError(400, 'Domain does not belong to this team');
    }

    // Check if team member exists
    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    // Check if team member belongs to the team
    if (teamMember.team.toString() !== teamId) {
      throw new ApiError(400, 'Team member does not belong to this team');
    }

    // Check if email address already exists
    const existingEmailAddress = await dbService.emailAddress.findOne({
      localPart: localPart.toLowerCase(),
      domain: domainId,
    });

    if (existingEmailAddress) {
      throw new ApiError(400, 'Email address already exists');
    }

    // If this is set as default, unset any other default email addresses
    if (isDefault) {
      await this.updateDefaultEmailAddress(teamMemberId);
    }

    // Create email address
    const emailAddress = await dbService.emailAddress.create({
      localPart: localPart.toLowerCase(),
      domain: domainId,
      teamMember: teamMemberId,
      displayName: displayName || localPart,
      status: EmailAddressStatus.Active,
      type,
      isDefault,
    });

    return emailAddress;
  }

  /**
   * Get all email addresses for a team member
   */
  async getTeamMemberEmailAddresses(teamId: string, teamMemberId: string): Promise<EmailAddress[]> {
    await dbService.connect();

    // Check if team member exists and belongs to the team
    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember || teamMember.team.toString() !== teamId) {
      throw new ApiError(404, 'Team member not found');
    }

    const emailAddresses = await dbService.emailAddress.find({ teamMember: teamMemberId })
      .populate('domain')
      .sort({ isDefault: -1, createdAt: -1 });

    return emailAddresses;
  }

  /**
   * Get an email address by ID
   */
  async getEmailAddressById(emailAddressId: string): Promise<EmailAddress> {
    await dbService.connect();

    const emailAddress = await dbService.emailAddress.findById(emailAddressId)
      .populate('domain');

    if (!emailAddress) {
      throw new ApiError(404, 'Email address not found');
    }

    return emailAddress;
  }

  /**
   * Get a domain by ID
   */
  async getDomainById(domainId: string): Promise<Domain> {
    await dbService.connect();

    const domain = await dbService.domain.findById(domainId);

    if (!domain) {
      throw new ApiError(404, 'Domain not found');
    }

    return domain;
  }

  /**
   * Update an email address
   */
  async updateEmailAddress(
    emailAddressId: string,
    updates: Partial<EmailAddress>
  ): Promise<EmailAddress> {
    await dbService.connect();

    const emailAddress = await this.getEmailAddressById(emailAddressId);

    // Prepare updates
    const allowedUpdates = ['displayName', 'status', 'isDefault'];
    const updateData: any = {};

    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = (updates as any)[key];
      }
    }

    // If setting as default, unset any other default email addresses
    if (updateData.isDefault) {
      await this.updateDefaultEmailAddress(emailAddress.teamMember.toString(), emailAddressId);
    }

    // Update the email address
    const updatedEmailAddress = await dbService.emailAddress.updateOne(
      emailAddressId,
      { $set: updateData },
      { new: true }
    ).populate('domain');

    return updatedEmailAddress as EmailAddress;
  }

  /**
   * Delete an email address
   */
  async deleteEmailAddress(emailAddressId: string): Promise<void> {
    await dbService.connect();

    const emailAddress = await this.getEmailAddressById(emailAddressId);

    // Don't allow deleting the default email address
    if (emailAddress.isDefault) {
      throw new ApiError(400, 'Cannot delete the default email address. Please set another email address as default first.');
    }

    // Don't allow deleting the primary email address
    if (emailAddress.type === EmailAddressType.Primary) {
      throw new ApiError(400, 'Cannot delete the primary email address.');
    }

    // Delete the email address
    await dbService.emailAddress.deleteOne({_id: emailAddressId});
  }

  // Team domains are fetched using the existing getTeamDomains API

  // Team permissions are handled in the API routes

  // Private methods

  /**
   * Update the default email address for a team member
   */
  private async updateDefaultEmailAddress(teamMemberId: string, excludeEmailAddressId?: string): Promise<void> {
    const query: any = {
      teamMember: teamMemberId,
      isDefault: true
    };

    if (excludeEmailAddressId) {
      query._id = { $ne: excludeEmailAddressId };
    }

    await dbService.emailAddress.update(
      query,
      { $set: { isDefault: false } }
    );
  }

  /**
   * Validate local part of email address
   */
  private isValidLocalPart(localPart: string): boolean {
    // Only allow letters, numbers, dots, hyphens, and underscores
    const regex = /^[a-zA-Z0-9.\\-_]+$/;
    return regex.test(localPart);
  }
}

export const emailAddressService = new EmailAddressService();
