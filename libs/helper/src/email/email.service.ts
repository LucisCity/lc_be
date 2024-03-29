import { Global, Injectable, Logger } from '@nestjs/common';
import { ChangePassInput, EventType, Sender, VerifyInput } from './email.type';
import * as Sengrid from '@sendgrid/mail';
import { OnEvent } from '@nestjs/event-emitter';
import { verify_email_template } from './email-template';
import { resetPasswordTemplate } from './email-template/reset_password.templates';
import { passwordUpdatedTemplate } from '@libs/helper/email/email-template/password_updated.templates';

@Global()
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  // private mailService: MailService;

  constructor() {
    if (!process.env.SEND_GRID_ACCESS_KEY) {
      console.error('SEND_GRID_ACCESS_KEY NOT SET');
      return;
    }
    // this.mailService = new MailService();
    Sengrid.setApiKey(process.env.SEND_GRID_ACCESS_KEY);
  }

  async send(from: Sender, to: string, content: string): Promise<void> {
    try {
      await Sengrid.send({
        to,
        from: {
          name: from.name,
          email: from.email,
        },
        subject: from.subject,
        text: content,
        html: content,
      });
    } catch (e) {
      console.log('Send Email Via Send Grid failed, error ' + e);
    }
  }

  @OnEvent(EventType.verifyEmail)
  handleVerifyEvent(payload: VerifyInput) {
    this.sendVerifyMail(payload);
  }

  @OnEvent(EventType.forgot)
  handleForgotEvent(payload: VerifyInput) {
    this.sendForgotMail(payload);
  }

  @OnEvent(EventType.changePass)
  handleChangePassEvent(payload: ChangePassInput) {
    this.sendChangePassMail(payload);
  }

  async sendVerifyMail(input: VerifyInput): Promise<boolean> {
    if (!process.env.SENDER_MAIL || !process.env.SENDER_NAME) {
      this.logger.error('SENDER_MAIL or SENDER_NAME not set');
      return;
    }
    const sender = new Sender();
    sender.email = process.env.SENDER_MAIL;
    sender.name = process.env.SENDER_NAME;
    sender.subject = 'Verify Email Address';
    const content = verify_email_template(input.userName, `${process.env.WEB_URL}/verify?token=${input.token}`);
    await this.send(sender, input.email, content);
    return true;
  }

  async sendForgotMail(input: VerifyInput): Promise<boolean> {
    if (!process.env.SENDER_MAIL || !process.env.SENDER_NAME) {
      this.logger.error('SENDER_MAIL or SENDER_NAME not set');
      return;
    }
    const sender = new Sender();
    sender.email = process.env.SENDER_MAIL;
    sender.name = process.env.SENDER_NAME;
    sender.subject = 'Reset password';
    const content = resetPasswordTemplate(input.userName, `${process.env.WEB_URL}/reset-password?token=${input.token}`);
    await this.send(sender, input.email, content);
    return true;
  }

  async sendChangePassMail(input: ChangePassInput): Promise<boolean> {
    if (!process.env.SENDER_MAIL || !process.env.SENDER_NAME) {
      this.logger.error('SENDER_MAIL or SENDER_NAME not set');
      return;
    }
    const sender = new Sender();
    sender.email = process.env.SENDER_MAIL;
    sender.name = process.env.SENDER_NAME;
    sender.subject = 'Password updated';
    const content = passwordUpdatedTemplate(input.userName);
    await this.send(sender, input.email, content);
    return true;
  }
}
