import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {Email, EmailLabel, EmailStatus} from '@/lib/types/models/email';
import {IntegrationType} from '@/lib/types/models/integration';
import {mailgunService} from '@/lib/services/mailgun';
import mongoose, {FilterQuery} from 'mongoose';
import {emailAddressService} from "@/lib/services/email-address";
import {generateEmailSummary} from "@/lib/utils/generateEmailSummary";

class EmailService {
  async prepareEmailConversation(emailData: Partial<Email>) {
    const parentEmail = await dbService.email.findOne({
      messageId: emailData.inReplyTo,
    });
    const createConversation = () => dbService.emailConversation.create({
      subject: emailData.subject || '',
      lastEmailAt: emailData.createdAt as Date,
      emailCount: 0
    });
    if (!parentEmail) {
      // create conversation
      return await createConversation();
    } else {
      const conversation = await dbService.emailConversation.findOne({
        _id: parentEmail.conversationId,
      });
      if (!conversation) return await createConversation();
    }
  }

  async createEmail(emailData: Partial<Email>): Promise<Email> {
    const conversation = await this.prepareEmailConversation(emailData);
    if (!conversation) throw new ApiError(400, 'Failed to prepare conversation');
    const newEmail = await dbService.email.create({
      ...emailData,
      summary: generateEmailSummary(emailData.body ?? ''),
      conversationId: conversation!._id,
    } as Email);
    conversation.lastEmail = newEmail._id as string;
    conversation.lastEmailAt = new Date();
    conversation.emailCount = conversation.emailCount + 1;
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
   * Update an email
   */
  async updateEmail(emailId: string, userId: string, updateData: Partial<Email>) {
    await dbService.connect();

    // Get the email
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user is the sender
    if (email.sender.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to update this email');
    }

    // Only allow updating certain fields
    const allowedUpdates = [
      'subject',
      'body',
      'bodyType',
      'recipients',
      'attachments',
      'status',
      'priority',
      'labels',
      'isStarred',
      'scheduledFor'
    ];

    const updates: any = {};
    for (const key of Object.keys(updateData)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = (updateData as any)[key];
      }
    }

    // Update the email
    const updatedEmail = await dbService.email.findOneAndUpdate(
      {_id: emailId},
      {$set: updates},
      {new: true}
    );

    // If subject was updated and this is part of a conversation, update the conversation
    if (updates.subject && email.conversationId) {
      await dbService.emailConversation.findOneAndUpdate(
        {_id: email.conversationId},
        {$set: {subject: updates.subject}}
      );
    }

    return updatedEmail;
  }

  /**
   * Delete an email
   */
  async deleteEmail(emailId: string, userId: string) {
    await dbService.connect();

    // Get the email
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user is the sender
    if (email.sender.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this email');
    }

    // If this is part of a conversation, update the conversation
    if (email.conversationId) {
      await dbService.emailConversation.findOneAndUpdate(
        {_id: email.conversationId},
        {$inc: {emailCount: -1}}
      );

      // If this was the last email in the conversation, delete the conversation
      const conversation = await dbService.emailConversation.findById(email.conversationId as string);
      if (conversation && conversation.emailCount <= 1) {
        await dbService.emailConversation.deleteOne({
          _id: email.conversationId
        });
      }
    }

    // Delete the email
    await dbService.email.delete({
      _id: emailId,
    });

    return {success: true};
  }

  /**
   * Mark an email as read
   */
  async markEmailAsRead(emailId: string, userId: string) {
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user has access to this email
    const userEmails = await this.getUserEmailAddresses(userId);
    const hasAccess =
      email.sender.toString() === userId ||
      email.recipients.some(r => userEmails.includes(r.email));

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this email');
    }

    // Mark as read
    await dbService.email.findOneAndUpdate(
      {_id: emailId},
      {
        $set: {isRead: true},
        $addToSet: {readBy: userId}
      }
    );

    return {success: true};
  }

  /**
   * Toggle star status of an email
   */
  async toggleStarEmail(emailId: string, userId: string) {
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user has access to this email
    const userEmails = await this.getUserEmailAddresses(userId);
    const hasAccess =
      email.sender.toString() === userId ||
      email.recipients.some(r => userEmails.includes(r.email));

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this email');
    }

    // Toggle star status
    const isStarred = !email.isStarred;
    await dbService.email.findOneAndUpdate(
      {_id: emailId},
      {$set: {isStarred}}
    );

    return {isStarred};
  }

  /**
   * Add or remove a label from an email
   */
  async toggleEmailLabel(emailId: string, labelId: string, userId: string) {
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user has access to this email
    const userEmails = await this.getUserEmailAddresses(userId);
    const hasAccess =
      email.sender.toString() === userId ||
      email.recipients.some(r => userEmails.includes(r.email));

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this email');
    }

    // Check if label exists and belongs to the user
    const label = await dbService.emailLabel.findOne({
      _id: labelId,
      user: userId
    });

    if (!label) {
      throw new ApiError(404, 'Label not found');
    }

    // Check if email already has this label
    const hasLabel = email.labels &&
      email.labels.some(l => l.toString() === labelId);

    if (hasLabel) {
      // Remove label
      await dbService.email.findOneAndUpdate(
        {_id: emailId},
        {$pull: {labels: labelId}}
      );
    } else {
      // Add label
      await dbService.email.findOneAndUpdate(
        {_id: emailId},
        {$addToSet: {labels: labelId}}
      );
    }

    return {hasLabel: !hasLabel};
  }

  /**
   * Send an email (change status from draft to sent)
   */
  async sendEmail(emailId: string, userId: string) {
    await dbService.connect();

    // Get the email
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Check if user is the sender
    if (email.sender.toString() !== userId) {
      throw new ApiError(403, 'You do not have permission to send this email');
    }

    // Check if email is a draft
    if (email.status !== EmailStatus.Draft) {
      throw new ApiError(400, 'Only draft emails can be sent');
    }

    // Update email status
    const sentAt = new Date();
    const updatedEmail = await dbService.email.findOneAndUpdate(
      {_id: emailId},
      {
        $set: {
          status: EmailStatus.Sent,
          sentAt
        }
      },
      {new: true}
    );

    // Update conversation lastEmailAt
    if (email.conversationId) {
      await dbService.emailConversation.findOneAndUpdate(
        {_id: email.conversationId},
        {$set: {lastEmailAt: sentAt}}
      );
    }

    return updatedEmail;
  }

  /**
   * Get user's email addresses (primary and any aliases)
   */
  private async getUserEmailAddresses(userId: string): Promise<string[]> {
    const user = await dbService.user.findById(userId);
    if (!user) {
      return [];
    }

    // For now, just return the primary email
    // In the future, this could include email aliases
    return [user.email];
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
    await dbService.connect();

    const {
      page = 1,
      limit = 20,
      labelId,
      search,
      isStarred,
      isRead,
      status,
      emailAddress
    } = options;

    // Get user's email addresses
    const userEmails = await emailAddressService.getTeamMemberEmailAddresses(teamId, memberId);

    if (!userEmails.find(x => x.fullAddress?.toLowerCase() === emailAddress?.toLowerCase())) {
      throw new ApiError(403, 'You do not have access to this email address');
    }

    // First, find all emails where the user is a participant
    const emailQuery: FilterQuery<Email> = {
      'recipients.email': emailAddress?.toLowerCase()
    };

    if (labelId) {
      emailQuery.labels = labelId;
    }

    if (isStarred !== undefined) {
      emailQuery.isStarred = isStarred;
    }

    if (isRead !== undefined) {
      emailQuery.isRead = isRead;
    }

    if (status) {
      emailQuery.status = status;
    }

    if (search) {
      emailQuery.$or = [
        {subject: {$regex: search, $options: 'i'}},
        {body: {$regex: search, $options: 'i'}}
      ];
    }

    // Get all conversation IDs where the user is a participant


    // Build query for conversations
    const query: any = {
      _id: {$in: conversationIds}
    };

    // Get conversations with pagination
    const conversations = await dbService.emailConversation.paginate({

    }, {
      page,
      limit,
      sort: {lastEmailAt: -1},
      populate: [
        {path: 'participants', select: 'fullName email avatar'}
      ]
    });

    return {
      ...conversations,
      docs: await Promise.all(conversations.docs.map(async (conversation) => {
        // Get the latest email in this conversation
        const email = await dbService.email.findOne(
          {
            conversationId: conversation._id,
            $or: [
              {'recipients.email': emailAddress}
            ]
          },
          {},
          {
            sort: {createdAt: -1},
            populate: [
              {path: 'sender', select: 'fullName email avatar'},
              {path: 'labels', select: 'name color'},
              {path: 'parentEmail', select: 'subject'}
            ]
          }
        );

        return {
          conversation,
          email
        };
      }))
    };
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
