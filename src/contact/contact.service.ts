import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly emailService: EmailService,
  ) { }

  async create(createContactDto: CreateContactDto) {
    await this.emailService.sendContactEmail(createContactDto)
    return "email sent";
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
