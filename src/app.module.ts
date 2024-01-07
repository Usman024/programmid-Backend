import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/role.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { DebtModule } from './debt/debt.module';
import * as Joi from 'joi';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { RedisConfigService } from './redis-config.service';
import { ContactModule } from './contact/contact.module';
import { applyRawBodyOnlyTo } from '@golevelup/nestjs-webhooks';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().default(4000),
        DOMAIN: Joi.string().default('http://localhost:4000'),
        MONGO_URI: Joi.string(),
        ACCESS_SECRET: Joi.string(),
        ACCESS_EXPIRES: Joi.string(),
        REFRESH_SECRET: Joi.string(),
        REFRESH_EXPIRES: Joi.string(),
        RESET_SECRET: Joi.string(),
        RESET_EXPIRES: Joi.string(),
        VERIFICATION_SECRET: Joi.string(),
        SENDGRID_API_KEY: Joi.string(),
        CLOUDINARY_CLOUD_NAME: Joi.string(),
        CLOUDINARY_API_KEY: Joi.string(),
        CLOUDINARY_API_SECRET: Joi.string(),
        STRIPE_SECRET_KEY: Joi.string(),
        STRIPE_WEBHOOK: Joi.string()
        // PROJECT_ID: Joi.string().required(),
        // CLIENT_EMAIL: Joi.string().required(),
        // PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useClass: RedisConfigService
    }),
    UserModule,
    DebtModule,
    CloudinaryModule,
    ChatModule,
    MessageModule,
    PaymentModule,
    ContactModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule { }
