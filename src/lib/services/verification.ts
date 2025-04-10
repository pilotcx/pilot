import {User} from '@/lib/types/models/user';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as Handlebars from 'handlebars/dist/handlebars.js';
import {dbService} from '@/lib/db/service';
import {VerificationType} from '@/lib/types/models/verification';
import {nanoid} from 'nanoid';
import {mailgunService} from '@/lib/services/mailgun';
import {HydratedDocument} from 'mongoose';
import {hashPassword} from '@/lib/utils/passwordUtils';
import {ApiError} from '@/lib/types/errors/api.error';

class VerificationService {
  templatePath = path.join(process.cwd(), 'src', 'lib', 'templates');

  async emailVerification(user: User) {
    const verification = await dbService.verification.create({
      user: user._id as any,
      type: VerificationType.VERIFY,
      token: nanoid(30),
    });

    const html = this.renderVerificationEmail({
      host: process.env.PUBLIC_HOST,
      fullName: user.fullName,
      verificationLink: `${process.env.PUBLIC_HOST}/verification/${verification.token}`,
    });
    await mailgunService.send(user.email, 'Xác thực tài khoản D Free Book', html);
    return "sent!";
  }

  async resetPassword(email: string) {
    const user = await dbService.user.findOne({
      email,
    });
    if (!user) throw new ApiError(404, "Email không hợp lệ");
    const verification = await dbService.verification.create({
      user: user._id as any,
      type: VerificationType.RESET_PASSWORD,
      token: nanoid(30),
    });
    const html = this.renderResetPassword({
      host: process.env.PUBLIC_HOST,
      fullName: user.fullName,
      verificationLink: `${process.env.PUBLIC_HOST}/auth/reset-password?code=${verification.token}`,
    });
    await mailgunService.send(user.email, 'Đổi mật khẩu tài khoản D Free Book', html);
  }

  renderVerificationEmail(context: any) {
    const source = fs.readFileSync(path.join(this.templatePath, 'auth', 'verification.hbs'), 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }

  renderResetPassword(context: any) {
    const source = fs.readFileSync(path.join(this.templatePath, 'auth', 'reset-password.hbs'), 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }

  processResetPassword(code: string, newPassword: string) {
    return this.processVerification(code, {newPassword});
  }

  async processVerification(code: string, extras: any = {}) {
    const verificationRecord = await dbService.verification.findOne({
      token: code,
    });
    if (!verificationRecord) return false;
    let user: HydratedDocument<User>;
    switch (verificationRecord.type) {
      case VerificationType.VERIFY:
        user = await dbService.user.findOne({
          _id: verificationRecord?.user,
        });
        user.emailVerified = true;
        await user.save();
        await verificationRecord.deleteOne();
        return true;
      case VerificationType.RESET_PASSWORD:
        user = await dbService.user.findOne({
          _id: verificationRecord?.user,
        });
        user.password = await hashPassword(extras.newPassword);
        await verificationRecord.deleteOne();
        await user.save();
        return true;
      default:
        return false;
    }
  }
}

export const verificationService = new VerificationService();
