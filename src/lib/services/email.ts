import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {Email, EmailLabel, EmailStatus} from '@/lib/types/models/email';
import {IntegrationType} from '@/lib/types/models/integration';
import {mailgunService} from '@/lib/services/mailgun';
import {FilterQuery} from 'mongoose';
import {emailAddressService} from "@/lib/services/email-address";
import {generateEmailSummary} from "@/lib/utils/generateEmailSummary";

class EmailService {
  async prepareEmailConversation(repliedMessageId?: string) {
    const createConversation = () => dbService.emailConversation.create({
      lastMessageAt: new Date(),
    });
    if (!repliedMessageId) return await createConversation();
    const parentEmail = await dbService.email.findOne({
      messageId: repliedMessageId,
    });
    if (!parentEmail) {
      // create conversation
      return await createConversation();
    } else {
      const conversation = await dbService.emailConversation.findOne({
        _id: parentEmail.conversation,
      });
      if (!conversation) return await createConversation();
    }
  }

  async createEmail(emailData: Partial<Email>): Promise<Email> {
    const conversation = await this.prepareEmailConversation(emailData.inReplyTo);
    if (!conversation) throw new ApiError(400, 'Failed to prepare conversation');
    const newEmail = await dbService.email.create({
      ...emailData,
      summary: generateEmailSummary(emailData.html ?? ''),
      conversationId: conversation!._id,
    } as Email);
    conversation.lastMessageAt = new Date();
    await conversation.save();
    return newEmail;
  }

  async getEmailById(emailId: string): Promise<Email | null> {
    await dbService.connect();
    return dbService.email.findById(emailId);
  }

  async getUserEmails(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      labelId?: string;
      isStarred?: boolean;
      isRead?: boolean;
      search?: string;
      status?: EmailStatus;
    } = {}
  ) {
    await dbService.connect();

    const {
      page = 1,
      limit = 20,
      labelId,
      isStarred,
      isRead,
      search,
      status
    } = options;

    // Build query
    const query: any = {
      $or: [
        {sender: userId},
        {'recipients.email': {$in: await this.getUserEmailAddresses(userId)}}
      ]
    };

    // Add filters
    if (labelId) {
      query.labels = labelId;
    }

    if (isStarred !== undefined) {
      query.isStarred = isStarred;
    }

    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        {subject: {$regex: search, $options: 'i'}},
        {body: {$regex: search, $options: 'i'}}
      ];
    }

    // Get emails with pagination
    return dbService.email.paginate(query, {
      page,
      limit,
      sort: {createdAt: -1},
      populate: [
        {path: 'sender', select: 'fullName email avatar'},
        {path: 'labels', select: 'name color'},
        {path: 'parentEmail', select: 'subject'}
      ]
    });
  }

  /**
   * Get emails in a conversation
   */
  async getConversationEmails(conversationId: string, userId: string) {
    await dbService.connect();

    // Check if conversation exists
    const conversation = await dbService.emailConversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    // Check if user is a participant
    const userEmails = await this.getUserEmailAddresses(userId);
    const isParticipant = await dbService.email.findOne({
      conversationId,
      $or: [
        {sender: userId},
        {'recipients.email': {$in: userEmails}}
      ]
    });

    if (!isParticipant) {
      throw new ApiError(403, 'You do not have access to this conversation');
    }

    // Get all emails in the conversation
    const emails = await dbService.email.find({conversationId})
      .sort({createdAt: 1})
      .populate('sender', 'fullName email avatar')
      .populate('labels', 'name color');

    return {
      conversation,
      emails
    };
  }

  /**
   * Delete an email
   */
  async deleteEmail(emailId: string, userId: string) {
    await dbService.connect();

    return {success: true};
  }

  /**
   * Mark an email as read
   */
  async markEmailAsRead(emailId: string, userId: string) {
    return {success: true};
  }

  /**
   * Toggle star status of an email
   */
  async toggleStarEmail(emailId: string, userId: string) {
    return {};
  }

  /**
   * Add or remove a label from an email
   */
  async toggleEmailLabel(emailId: string, labelId: string, userId: string) {
  }

  /**
   * Send an email (change status from draft to sent)
   */
  async sendEmail(emailId: string, userId: string) {
  }

  /**
   * Get user's email addresses (primary and any aliases)
   */
  private async getUserEmailAddresses(userId: string): Promise<string[]> {
    return [];
  }

  // Label Management

  /**
   * Create a new email label
   */
  async createLabel(labelData: Partial<EmailLabel>): Promise<EmailLabel> {
    return await dbService.emailLabel.create(labelData as EmailLabel);
  }

  /**
   * Get all labels for a user
   */
  async getUserLabels(userId: string) {
    await dbService.connect();

    // Get user's labels
    return dbService.emailLabel.find({
      $or: [
        {user: userId},
        {isSystem: true}
      ]
    }).sort({isSystem: -1, name: 1});
  }

  /**
   * Update a label
   */
  async updateLabel(labelId: string, userId: string, updateData: Partial<EmailLabel>) {
    await dbService.connect();

    // Get the label
    const label = await dbService.emailLabel.findById(labelId);
    if (!label) {
      throw new ApiError(404, 'Label not found');
    }

    // Check if user owns the label
    if (label.user.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to update this label');
    }

    // Check if label is a system label
    if (label.isSystem) {
      throw new ApiError(403, 'System labels cannot be modified');
    }

    // Only allow updating certain fields
    const allowedUpdates = ['name', 'color', 'description'];
    const updates: any = {};

    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = (updateData as any)[key];
      }
    }

    // Update the label
    return await dbService.emailLabel.findOneAndUpdate(
      {_id: labelId},
      {$set: updates},
      {new: true}
    );
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string, userId: string) {
    await dbService.connect();

    // Get the label
    const label = await dbService.emailLabel.findById(labelId);
    if (!label) {
      throw new ApiError(404, 'Label not found');
    }

    // Check if user owns the label
    if (label.user.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this label');
    }

    // Check if label is a system label
    if (label.isSystem) {
      throw new ApiError(403, 'System labels cannot be deleted');
    }

    // Remove the label from all emails
    await dbService.email.update(
      {labels: labelId},
      {$pull: {labels: labelId}}
    );

    // Delete the label
    await dbService.emailLabel.deleteOne({_id: labelId});

    return {success: true};
  }

  /**
   * Create default system labels for a new user
   */
  async createDefaultLabelsForUser(userId: string) {
    await dbService.connect();

    // Check if user already has system labels
    const existingLabels = await dbService.emailLabel.find({
      user: userId,
      isSystem: true
    });

    if (existingLabels.length > 0) {
      return existingLabels;
    }

    // Create default system labels
    const defaultLabels = [
      {name: 'Inbox', color: '#3B82F6', isSystem: true, user: userId},
      {name: 'Sent', color: '#10B981', isSystem: true, user: userId},
      {name: 'Drafts', color: '#6B7280', isSystem: true, user: userId},
      {name: 'Starred', color: '#F59E0B', isSystem: true, user: userId},
      {name: 'Important', color: '#EF4444', isSystem: true, user: userId},
      {name: 'Spam', color: '#7C3AED', isSystem: true, user: userId},
      {name: 'Trash', color: '#6B7280', isSystem: true, user: userId}
    ];

    return await Promise.all(
      defaultLabels.map(label => dbService.emailLabel.create(label))
    );
  }

  /**
   * Get conversations with the latest email from each conversation
   * This is used for displaying a conversation list where only the latest email in each thread is shown
   */
  async getConversationsWithLatestEmail(
    teamId: string,
    memberId: string,
    options: {
      page?: number;
      limit?: number;
      labelId?: string;
      search?: string;
      isStarred?: boolean;
      isRead?: boolean;
      status?: EmailStatus;
      emailAddress?: string; // Filter by specific email address
    } = {}
  ) {
    return [];
  }

  /**
   * Get a conversation by ID
   */
  async getConversationById(conversationId: string, userId: string) {
    await dbService.connect();

    // Get the conversation
    const conversation = await dbService.emailConversation.findById(conversationId)
      .populate('participants', 'fullName email avatar');

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    // Check if user is a participant
    const userEmails = await this.getUserEmailAddresses(userId);
    const isParticipant = await dbService.email.findOne({
      conversationId,
      $or: [
        {sender: userId},
        {'recipients.email': {$in: userEmails}}
      ]
    });

    if (!isParticipant) {
      throw new ApiError(403, 'You do not have access to this conversation');
    }

    return conversation;
  }

  /**
   * Send an email using Mailgun integration
   */
  async sendEmailWithMailgun(emailId: string, teamId: string): Promise<Email> {
    await dbService.connect();

    // Get the email
    const email = await this.getEmailById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Get the team's Mailgun integration
    const integration = await dbService.integration.findOne({
      team: teamId,
      type: IntegrationType.Mailgun,
      enabled: true,
      status: 'active'
    });

    if (!integration) {
      throw new ApiError(404, 'No active Mailgun integration found for this team');
    }

    // Send the email using Mailgun
    await mailgunService.sendEmail(emailId, integration._id.toString());

    // Update the email status
    const updatedEmail = await dbService.email.update(
      {_id: emailId},
      {
        $set: {
          status: EmailStatus.Sent,
          sentAt: new Date()
        }
      },
      {new: true}
    );

    return updatedEmail as Email;
  }
}

export const emailService = new EmailService();
