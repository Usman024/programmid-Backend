import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DebtModule } from 'src/debt/debt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtSchema } from 'src/debt/entities/debt.entity';
import { AgendaModule } from "@agent-ly/nestjs-agenda";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentProcessor } from './payment.processor';
import { EmailModule } from 'src/email/email.module';
import { StripeModule } from '@golevelup/nestjs-stripe';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentProcessor],
  imports: [
    DebtModule,
    EmailModule,
    MongooseModule.forFeature([
      { name: 'Debt', schema: DebtSchema, collection: 'Debts' },
    ]),
    AgendaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        db: {
          address: configService.get('MONGO_URI'),
        }
      }),
      inject: [ConfigService],
    }),
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_SECRET_KEY'),
        apiVersion: "2022-08-01",
      }),
      inject: [ConfigService],
    })
  ]
})

export class PaymentModule { }
