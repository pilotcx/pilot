import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {
  Integration,
  IntegrationStatus,
  IntegrationType,
  MailgunConfig,
  MailgunInboundMessage
} from '@/lib/types/models/integration';
import {Email, EmailPriority, EmailRecipient, EmailStatus} from '@/lib/types/models/email';
import {emailService} from '@/lib/services/email';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import crypto from 'crypto';

class MailgunService {
  /**
   * Create a new Mailgun integration for a team
   */
  async createIntegration(teamId: string, config: MailgunConfig, name: string = 'Mailgun'): Promise<Integration> {
    await dbService.connect();

    // Check if team already has a Mailgun integration
    const existingIntegration = await dbService.integration.findOne({
      team: teamId,
      type: IntegrationType.Mailgun
    });

    if (existingIntegration) {
      throw new ApiError(400, 'Team already has a Mailgun integration');
    }

    // Validate the Mailgun credentials
    const {valid} = await this.validateMailgunCredentials(config.apiKey);

    if (!valid) {
      // Create integration with failed status
      const integration = await dbService.integration.create({
        team: teamId,
        type: IntegrationType.Mailgun,
        name,
        status: IntegrationStatus.Failed,
        config,
        errorMessage: 'Invalid Mailgun API key',
        enabled: false
      });

      return integration;
    }

    // Create the integration
    const integration = await dbService.integration.create({
      team: teamId,
      type: IntegrationType.Mailgun,
      name,
      status: IntegrationStatus.Active,
      config,
      lastSyncAt: new Date(),
      enabled: true
    });

    return integration;
  }

  /**
   * Update a Mailgun integration
   */
  async updateIntegration(integrationId: string, updates: Partial<MailgunConfig> & {
    name?: string
  }): Promise<Integration> {
    await dbService.connect();

    // Get the integration
    const integration = await dbService.integration.findById(integrationId);
    if (!integration) {
      throw new ApiError(404, 'Integration not found');
    }

    // Check if it's a Mailgun integration
    if (integration.type !== IntegrationType.Mailgun) {
      throw new ApiError(400, 'Not a Mailgun integration');
    }

    // Prepare updates
    const updatedConfig = {
      ...integration.config,
      ...updates
    };

    // If API key changed, validate the credentials
    if (updates.apiKey && updates.apiKey !== integration.config.apiKey) {
      const {valid} = await this.validateMailgunCredentials(updates.apiKey);

      if (!valid) {
        // Update integration with failed status
        const updatedIntegration = await dbService.integration.updateOne(
          integrationId,
          {
            $set: {
              status: IntegrationStatus.Failed,
              config: updatedConfig,
              errorMessage: 'Invalid Mailgun API key',
              ...(updates.name ? {name: updates.name} : {})
            }
          },
          {new: true}
        );

        return updatedIntegration as Integration;
      }
    }

    // Update the integration
    const updatedIntegration = await dbService.integration.updateOne(
      integrationId,
      {
        $set: {
          status: IntegrationStatus.Active,
          config: updatedConfig,
          lastSyncAt: new Date(),
          errorMessage: null,
          ...(updates.name ? {name: updates.name} : {})
        }
      },
      {new: true}
    );

    return updatedIntegration as Integration;
  }

  /**
   * Get a Mailgun integration by team ID
   */
  async getIntegrationByTeam(teamId: string): Promise<Integration | null> {
    await dbService.connect();

    return dbService.integration.findOne({
      team: teamId,
      type: IntegrationType.Mailgun
    });
  }

  /**
   * Delete a Mailgun integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    await dbService.connect();

    // Get the integration
    const integration = await dbService.integration.findById(integrationId);
    if (!integration) {
      throw new ApiError(404, 'Integration not found');
    }

    // Check if it's a Mailgun integration
    if (integration.type !== IntegrationType.Mailgun) {
      throw new ApiError(400, 'Not a Mailgun integration');
    }

    // Delete the integration
    await dbService.integration.deleteOne({_id: integrationId});
  }

  /**
   * Send an email using Mailgun
   */
  async sendEmail(emailId: string, integrationId: string): Promise<void> {
    await dbService.connect();

    // Get the email
    const email = await dbService.email.findById(emailId);
    if (!email) {
      throw new ApiError(404, 'Email not found');
    }

    // Get the integration
    const integration = await dbService.integration.findById(integrationId);
    if (!integration) {
      throw new ApiError(404, 'Integration not found');
    }

    // Check if it's a Mailgun integration
    if (integration.type !== IntegrationType.Mailgun) {
      throw new ApiError(400, 'Not a Mailgun integration');
    }

    // Check if integration is active
    if (integration.status !== IntegrationStatus.Active) {
      throw new ApiError(400, 'Mailgun integration is not active');
    }

    // Check if outbound is enabled
    const config = integration.config as MailgunConfig;
    if (!config.outboundEnabled) {
      throw new ApiError(400, 'Outbound email is disabled for this integration');
    }

    // Initialize Mailgun client
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: config.apiKey
    });

    // Prepare recipients
    const to = email.recipients
      .filter(r => r.type === 'to')
      .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
      .join(', ');

    const cc = email.recipients
      .filter(r => r.type === 'cc')
      .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
      .join(', ');

    const bcc = email.recipients
      .filter(r => r.type === 'bcc')
      .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
      .join(', ');

    // Get the sender's information
    const sender = await dbService.user.findById(email.sender as string);
    if (!sender) {
      throw new ApiError(404, 'Sender not found');
    }

    // Prepare message data
    const messageData: any = {
      from: sender.fullName ? `${sender.fullName} <${sender.email}>` : sender.email,
      to,
      subject: email.subject,
      [email.bodyType === 'html' ? 'html' : 'text']: email.body,
      'h:Message-Id': email._id.toString(),
    };

    // Add CC and BCC if present
    if (cc) {
      messageData.cc = cc;
    }

    if (bcc) {
      messageData.bcc = bcc;
    }

    // Set reply-to to the sender's email
    messageData['h:Reply-To'] = sender.email;

    // Add attachments if present
    if (email.attachments && email.attachments.length > 0) {
      // Note: In a real implementation, you would need to handle attachments
      // This is a simplified version
      // messageData.attachment = email.attachments.map(a => ({ ...a }));
    }

    try {
      // Use a default domain
      const domain = 'sandbox.mailgun.org'; // Default sandbox domain
      const result = await mg.messages.create(domain, messageData);

      // Update email status
      await dbService.email.updateOne(
        emailId,
        {
          $set: {
            status: EmailStatus.Sent,
            sentAt: new Date()
          }
        }
      );
    } catch (error: any) {
      // Update email status to failed
      await dbService.email.updateOne(
        emailId,
        {
          $set: {
            status: EmailStatus.Failed,
            errorMessage: error.message || 'Failed to send email'
          }
        }
      );

      throw new ApiError(500, error.message || 'Failed to send email');
    }
  }

  /**
   * Process an inbound email from Mailgun webhook
   */
  async processInboundEmail(payload: MailgunInboundMessage, teamId: string): Promise<Email> {
    // Get the team's Mailgun integration
    const integration = await this.getIntegrationByTeam(teamId);
    if (!integration) {
      throw new ApiError(404, 'Mailgun integration not found for this team');
    }

    // Check if integration is active
    if (integration.status !== IntegrationStatus.Active) {
      throw new ApiError(400, 'Mailgun integration is not active');
    }

    // Check if inbound is enabled
    const config = integration.config as MailgunConfig;
    if (!config.inboundEnabled) {
      throw new ApiError(400, 'Inbound email is disabled for this integration');
    }

    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, config.webhookSigningKey)) {
      throw new ApiError(401, 'Invalid webhook signature');
    }

    // Prepare recipients
    const recipients: EmailRecipient[] = [
      {
        email: payload.recipient,
        type: 'to'
      }
    ];

    // Create the email
    const emailData: Partial<Email> = {
      subject: payload.subject,
      body: payload.bodyHtml || payload.bodyPlain,
      from: payload.from,
      recipients,
      status: EmailStatus.Sent,
      priority: EmailPriority.Normal,
      isRead: false,
      sentAt: new Date(payload.timestamp * 1000)
    };

    // Create the email using the email service
    return await emailService.createEmail(emailData);
  }

  /**
   * Verify Mailgun webhook signature
   */
  private verifyWebhookSignature(payload: MailgunInboundMessage, signingKey: string): boolean {
    // In a real implementation, you would verify the signature
    // This is a simplified version
    if (!payload.token || !payload.signature || !payload.timestamp) {
      return false;
    }

    const encodedToken = crypto
      .createHmac('sha256', signingKey)
      .update(payload.timestamp + payload.token)
      .digest('hex');

    return encodedToken === payload.signature;
  }

  /**
   * Validate Mailgun credentials and return available domains
   */
  async validateMailgunCredentials(apiKey: string): Promise<{ valid: boolean, domains: any[] }> {
    // Initialize Mailgun client
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: apiKey
    });

    try {
      // Try to get domains to validate the API key
      const domains = await mg.domains.list();
      return {valid: true, domains: domains || []};
    } catch (error) {
      return {valid: false, domains: []};
    }
  }
}

export const mailgunService = new MailgunService();
