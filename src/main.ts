import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { applicationDefault } from 'firebase-admin/app';
import multipart from "fastify-multipart";
import * as path from 'node:path';
import { Worker } from "node:worker_threads"

async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      disableRequestLogging: true,
    }),
    {
      rawBody: true
    }
  );

  // const app = await NestFactory.create<NestFastifyApplication>(AppModule, {
  //   bodyParser: false
  // });const worker = 

  const configService: ConfigService = app.get(ConfigService);

  // const adminConfig: ServiceAccount = {
  //   "projectId": configService.get<string>('PROJECT_ID'),
  //   "privateKey": configService.get<string>('PRIVATE_KEY').replace(/\\n/g, '\n'),
  //   "clientEmail": configService.get<string>('CLIENT_EMAIL'),
  // };

  // admin.initializeApp({
  //   credential: applicationDefault()
  // });

  const config = new DocumentBuilder()
    .setTitle('God Api Documentation')
    .setDescription('This is the API documentation for God API controllers. This documentation only covers HTTP Client-Server Communication in either JSON or Multi-part FormData')
    .setVersion(process.env.npm_package_version)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.register(multipart)

  app.enableCors({
    origin: '*'
  });

  await app.listen(process.env.PORT, '0.0.0.0', (err) => {
    if (err) { console.log(err) }
    console.log(`Server listening on ${process.env.PORT}`);
  });

  new Worker(path.join(__dirname, "utils", "dailyMessageScheduler.js"));
}
bootstrap();
