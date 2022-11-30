import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private service: MailerService) {}

  async sendMail(email: string, name: string, token: string) {
    this.service.sendMail({
      to: email,
      subject: 'Confirm your email | KanjiUp Auth',
      template: 'confirmation',
      context: {
        name,
        link: `http://localhost:3000/auth/confirmation?token=${token}`,
      },
    });
  }
}
