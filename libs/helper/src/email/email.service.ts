import { Global, Injectable, Logger } from '@nestjs/common';
import { EventType, Sender, VerifyInput } from './email.type';
import * as Sengrid from '@sendgrid/mail';
import { OnEvent } from '@nestjs/event-emitter';
import { verify_email_template } from './email-template';

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

  async sendVerifyMail(input: VerifyInput): Promise<boolean> {
    console.log('verifyEmail: ', input);

    if (!process.env.SENDER_MAIL || !process.env.SENDER_NAME) {
      this.logger.error('SENDER_MAIL or SENDER_NAME not set');
      return;
    }
    const sender = new Sender();
    sender.email = process.env.SENDER_MAIL;
    sender.name = process.env.SENDER_NAME;
    sender.subject = 'Verify Email Address';
    const content = verify_email_template(
      input.userName,
      `${process.env.WEB_URL}/verify/${input.token}`,
    );
    await this.send(sender, input.email, content);
    return true;
  }

  async sendForgotMail(input: VerifyInput): Promise<boolean> {
    console.log('verifyEmail: ', input);

    if (!process.env.SENDER_MAIL || !process.env.SENDER_NAME) {
      this.logger.error('SENDER_MAIL or SENDER_NAME not set');
      return;
    }
    const sender = new Sender();
    sender.email = process.env.SENDER_MAIL;
    sender.name = process.env.SENDER_NAME;
    sender.subject = 'Verify Email Address';
    const content = verify_email_template(
      input.userName,
      `${process.env.WEB_URL}/reset-pass/${input.token}`,
    );
    await this.send(sender, input.email, content);
    return true;
  }
}
