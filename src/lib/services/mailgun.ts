import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {
  Integration,
  IntegrationStatus,
  IntegrationType,
  MailgunConfig,
  MailgunInboundMessage
} from '@/lib/types/models/integration';
import {Email, EmailType} from '@/lib/types/models/email';
import {emailService} from '@/lib/services/email';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import crypto from 'crypto';
import {generateEmailSummary} from "@/lib/utils/generateEmailSummary";

class MailgunService {

  async getTeamClient(teamId: string) {
    const integration = await this.getIntegrationByTeam(teamId);
    if (!integration) throw new ApiError(404, 'Mailgun integration not found for this team');
    if (integration.status !== IntegrationStatus.Active) throw new ApiError(400, 'Mailgun integration is not active');
    const config = integration.config as MailgunConfig;
    if (!config.outboundEnabled) throw new ApiError(400, 'Outbound email is disabled for this integration');
    const mailgun = new Mailgun(FormData);
    return mailgun.client({
      username: 'api',
      key: config.apiKey
    });
  }
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
  }

  /**
   * Process an inbound email from Mailgun webhook
   */
  async processInboundEmail(payload: MailgunInboundMessage, teamId: string) {
    const integration = await this.getIntegrationByTeam(teamId);
    if (!integration) throw new ApiError(404, 'Mailgun integration not found for this team');
    if (integration.status !== IntegrationStatus.Active) throw new ApiError(400, 'Mailgun integration is not active');
    const config = integration.config as MailgunConfig;
    if (!config.inboundEnabled) throw new ApiError(400, 'Inbound email is disabled for this integration');
    if (!this.verifyWebhookSignature(payload, config.webhookSigningKey)) throw new ApiError(401, 'Invalid webhook signature');

    const headers = this.parseMessageHeaders(payload.messageHeaders);
    const recipients = this.parseEmailList(payload.recipient);
    for await (const recipient of recipients) {
      const emailData: Partial<Email> = {
        recipient,
        subject: payload.subject,
        html: payload.bodyHtml || payload.bodyPlain,
        summary: this.generateEmailSummary(payload.bodyHtml ? payload.bodyHtml : payload.bodyPlain),
        from: payload.from,
        inReplyTo: headers['in-reply-to'],
        direction: EmailType.Incoming,
        messageId: payload.messageId,
        isRead: false,
        to: this.parseEmailList(headers['to']),
        cc: this.parseEmailList(headers['cc']),
        bcc: this.parseEmailList(headers['bcc']),
      };
      await emailService.createEmail(teamId, emailData);
    }
  }

  generateEmailSummary(body: string, maxLength: number = 100): string {
    return generateEmailSummary(body, maxLength);
  }

  parseEmailList(addressList?: string): string[] {
    if (!addressList) return [];

    return addressList
      .split(",")
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
  }

  parseMessageHeaders(headers: Array<[string, string]>): Record<string, string> {
    const parsedHeaders: Record<string, string> = {};

    headers.forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase(); // Convert header name to lowercase
      parsedHeaders[normalizedKey] = value;
    });

    return parsedHeaders;
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
