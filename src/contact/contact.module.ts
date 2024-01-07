import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    EmailModule
  ],
  controllers: [ContactController],
  providers: [ContactService]
})
export class ContactModule { }
