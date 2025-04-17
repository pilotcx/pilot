import {dbService} from "@/lib/db/service";
import {Email, EmailType} from "@/lib/types/models/email";
import {emailService} from "@/lib/services/email";

export class MailgunAdapter {

  async receiveEmail(data: any) {
    const allRecipients = data.recipient;
    const attachments = await this.storeAttachments(data);
    for (let recipient of (allRecipients?.split(',') || [])) {
      const target = await dbService.emailAddress.findOne({
        fullAddress: recipient,
      });
      if (!target) continue;
      const inReplyTo = data['In-Reply-To'];
      const references = data?.['References']?.split(' ');
      const newEmail: Email = {
        owner: target.teamMember as string,
        subject: data.subject,
        recipient: recipient,
        body: data['body-html'],
        from: data.from,
        headers: [],
        messageId: data['Message-Id'],
        sender: data.sender,
        strippedText: data['stripped-text'],
        to: data.To,
        type: EmailType.Incoming,
        raw: data,
        contentType: data['Content-Type'],
        dkimSignature: data['Dkim-Signature'],
        replyTo: data['X-Reply-To'],
        inReplyTo,
        references,
        labels: ['inbox'],
        attachments,
      };
      return emailService.createEmail(newEmail);
    }
  }

  async storeAttachments(data: any) {
    const attachments = data.attachments ? JSON.parse(data.attachments) : [];
    const contentIdMap = data['content-id-map'] ? JSON.parse(data['content-id-map']) : {};
    let mappedAttachments: string[] = [];
    for (let attachment of attachments) {
      const {name, 'content-type': contentType, size, url} = attachment;
      let cid = '';
      for (let mapCid of Object.keys(contentIdMap)) {
        if (contentIdMap[mapCid] === url) {
          cid = mapCid.replace('<', '').replace('>', '');
        }
      }
      // TODO: storage for attachments
      // const storedAttachment = await this.storage.uploadEmailAttachment(contentType, name, cid, size, url);
      // mappedAttachments.push(storedAttachment._id.toString());
    }
    return mappedAttachments;
  }

}

export const mailgunAdapter = new MailgunAdapter();
