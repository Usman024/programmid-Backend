import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [EmailService],
  imports: [
    SendGridModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get<string>('SENDGRID_API_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [EmailService],
})
export class EmailModule {}
