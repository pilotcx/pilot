import FormData from 'form-data';
import Mailgun from 'mailgun.js';

class MailgunService {
  domain = "dfreebook.com";
  mailgun = new Mailgun(FormData);

  getClient() {
    return this.mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    })
  }

  async send(email: string, subject: string, html: string) {
    const client = this.getClient();
    await client.messages.create(this.domain, {
      from: 'noreply@dfreebook.com',
      to: email,
      subject,
      html,
    });
  }
}

export const mailgunService = new MailgunService();
