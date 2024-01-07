import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import customerVerification from './templates/customerVerification';
import resetPassword from './templates/resetPassword';
import { getUnixTime } from 'date-fns';
import { CreateContactDto } from 'src/contact/dto/create-contact.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectSendGrid() private readonly sendGridService: SendGridService,
    private readonly configService: ConfigService,
  ) { }

  async sendAccountVerificationEmail(to: string, url: string, tempPassword?: string) {
    let html = ``;

    if (tempPassword) {
      html = customerVerification(url, tempPassword);
    }
    else {
      html = customerVerification(url);
    }

    await this.sendGridService.send({
      to,
      from: this.configService.get<string>('SENDGRID_FROM'),
      subject: 'Global Operations Department Account Verification',
      html,
    });
  }


  async sendPasswordResetEmail(to: string, url: string) {
    await this.sendGridService.send({
      to,
      from: this.configService.get<string>('SENDGRID_FROM'),
      subject: 'Global Operations Department Account Password Reset',
      html: resetPassword(url),
    });
  }

  // async sendOrderConfirmationEmail(to: string, data: any) {
  //   await this.sendGridService.send({
  //     to,
  //     from: this.configService.get<string>('SENDGRID_FROM'),
  //     subject: 'Global Operations Department Order Confirmation',
  //     html: orderConfirmation(),
  //   });
  // }

  async sendContactEmail(data: CreateContactDto) {
    await this.sendGridService.send({
      to: this.configService.get<string>('SENDGRID_FROM'),
      from: this.configService.get<string>('SENDGRID_FROM'),
      subject: `${data.title} - ${data.name}`,
      html: `<p><b>From:</b>${data.email}</br><b>Name:</b>${data.name}</p></br><b>Title:</b>${data.title}</p></br><b>Description:</b>${data.description}</p>`,
    });
  }

  async sendReminderEmail(to: string, data: any) {
    await this.sendGridService.send({
      to,
      from: this.configService.get<string>('SENDGRID_FROM'),
      subject: `${data} Global Operations Department Payment Reminder`,
      html: "<h1>this is a reminder emails</h1>",
      sendAt: getUnixTime(data)
    });
  }
}
