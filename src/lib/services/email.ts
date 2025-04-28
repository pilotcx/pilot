import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {Email, EmailAttachment, EmailLabel, EmailStatus} from '@/lib/types/models/email';
import {IntegrationType} from '@/lib/types/models/integration';
import {mailgunService} from '@/lib/services/mailgun';
import {emailAddressService} from "@/lib/services/email-address";
import path from 'path';
import fs from 'fs/promises';
import {nanoid} from "nanoid";

class EmailService {
  async prepareEmailConversation(teamId: string, subject: string, repliedMessageId?: string, participatedEmails: string[] = []) {
    const createConversation = () => dbService.emailConversation.create({
      lastMessageAt: new Date(),
      subject,
      team: teamId,
      participatedEmails: [...new Set(participatedEmails)], // Use Set to ensure uniqueness
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
      return conversation;
    }
  }

  async createEmail(teamId: string, emailData: Partial<Email>): Promise<Email> {
    // Collect all email addresses involved in this email
    const participatedEmails: string[] = [];

    // Add sender email
    if (emailData.from) {
      participatedEmails.push(emailData.from);
    }

    // Add recipient emails
    if (emailData.to && Array.isArray(emailData.to)) {
      participatedEmails.push(...emailData.to);
    }

    // Add CC emails if they exist
    if (emailData.cc && Array.isArray(emailData.cc)) {
      participatedEmails.push(...emailData.cc);
    }

    // Add BCC emails if they exist
    if (emailData.bcc && Array.isArray(emailData.bcc)) {
      participatedEmails.push(...emailData.bcc);
    }

    // Add recipient if it exists (used in some cases)
    if (emailData.recipient) {
      participatedEmails.push(emailData.recipient);
    }

    // Prepare the conversation with the collected emails
    const conversation = await this.prepareEmailConversation(
      teamId,
      emailData.subject ?? "Untitled",
      emailData.inReplyTo,
      participatedEmails
    );

    console.log('prepared conversation', conversation._id.toString());
    if (!conversation) throw new ApiError(400, 'Failed to prepare conversation');

    // Create the email with the conversation reference
    const newEmail = await dbService.email.create({
      ...emailData,
      conversation: conversation._id,
      // Generate a unique message ID if not provided
      messageId: emailData.messageId || `${Date.now()}.${Math.random().toString(36).substring(2)}@${emailData.from?.split('@')[1] || 'example.com'}`,
    } as Email);

    // Update the conversation's lastMessageAt timestamp and participated emails
    conversation.lastMessageAt = new Date();

    // Add new emails to the existing participatedEmails array
    if (!conversation.participatedEmails) {
      conversation.participatedEmails = [];
    }

    // Combine existing and new emails, then remove duplicates
    const updatedEmails = [...new Set([...conversation.participatedEmails, ...participatedEmails])];
    conversation.participatedEmails = updatedEmails;

    await conversation.save();

    return newEmail;
  }

  getEmailById(emailId: string) {
    return dbService.email.findById(emailId);
  }

  async getEmailByMessageId(messageId: string) {
    return dbService.email.findOne({
      messageId,
    })
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
    return dbService.emailLabel.findOneAndUpdate(
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
   * Optimized to use the participatedEmails field in conversations
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
    const {
      page = 1,
      limit = 20,
      labelId,
      search,
      isStarred,
      isRead,
      emailAddress
    } = options;
    const memberEmailAddresses = await emailAddressService.getTeamMemberEmailAddresses(teamId, memberId);

    if (!memberEmailAddresses.find(x => x.fullAddress === emailAddress)) throw new ApiError(400, 'FORBIDDEN');
    const filter = {
      participatedEmails: {
        $in: [emailAddress],
      }
    };
    const totalDocs = await dbService.emailConversation.count(filter)
    const conversations = await dbService.emailConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const conversationIds = conversations.map(conv => conv._id);
    const latestEmails = await dbService.email.aggregate([
      { $match: { conversation: { $in: conversationIds } } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$conversation",
          latestEmail: { $first: "$$ROOT" }
        }
      }
    ]);
    const emailMap = new Map();
    latestEmails.forEach(item => {
      emailMap.set(item._id.toString(), item.latestEmail);
    });

    const results = conversations.map(conversation => {
      return {
        conversation,
        email: emailMap.get(conversation._id.toString()) || null
      };
    });

    // Return in paginated format
    return {
      docs: results,
      totalDocs,
      limit,
      page,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1,
      pagingCounter: (page - 1) * limit + 1,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page * limit < totalDocs ? page + 1 : null
    };
  }

  /**
   * Helper method to return an empty paginated result
   */
  private emptyPaginatedResult(page: number, limit: number) {
    return {
      docs: [],
      totalDocs: 0,
      limit,
      page,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      pagingCounter: 0,
      prevPage: null,
      nextPage: null
    };
  }

  /**
   * Get a conversation by ID
   */
  getConversationById(conversationId: string) {
    return dbService.emailConversation.findById(conversationId);
  }

  async getConversationEmails(conversationId: string, emailAddress: string) {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new ApiError(404, 'CONVERSATION_NOT_FOUND');
    return dbService.email.find({
      conversation: conversationId,
      $or: [{
        recipient: {$in: emailAddress},
      }, {
        from: {$in: emailAddress},
      }, {
        to: {$in: emailAddress},
      }]
    });
  }

  /**
   * Upload an email attachment
   * @param file The file to upload
   * @param teamId The team ID
   * @returns The uploaded file information
   */
  async uploadAttachment(file: File, teamId: string): Promise<EmailAttachment> {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', teamId);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${nanoid()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Convert File to Buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return the attachment information
    return {
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      url: `/uploads/${teamId}/${uniqueFilename}`
    };
  }

  /**
   * Send an email using Mailgun integration
   * @param emailId The email ID to send
   * @param teamId The team ID
   * @returns The updated email
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

    // Update the email with sent status
    const updatedEmail = await dbService.email.findOneAndUpdate(
      {_id: emailId},
      {
        $set: {
          direction: 'outgoing',
          // We don't have status field in the new model, but we can add it if needed
        }
      },
      {new: true}
    );

    // Update the conversation's lastMessageAt timestamp
    if (email.conversation) {
      await dbService.emailConversation.findOneAndUpdate(
        {_id: email.conversation},
        {$set: {lastMessageAt: new Date()}}
      );
    }

    return updatedEmail as Email;
  }

  async checkMemberConversationAccessible(teamId: string, memberId: string, conversationId: string) {
    const emailAddresses = await emailAddressService.getTeamMemberEmailAddresses(teamId, memberId);
    const ownedAddresses = emailAddresses.map(addr => addr.fullAddress);
    return dbService.email.exists({
      conversation: conversationId,
      $or: [{
        recipient: {$in: ownedAddresses},
      }, {
        from: {$in: ownedAddresses},
      }, {
        to: {$in: ownedAddresses},
      }]
    });
  }

  /**
   * Get all unique email addresses that have participated in a conversation
   * @param conversationId The ID of the conversation
   * @returns Array of unique email addresses
   */
  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    // Return the participated emails from the conversation
    return conversation.participatedEmails || [];
  }
}

export const emailService = new EmailService();
