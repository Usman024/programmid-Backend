import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { UserService } from 'src/user/user.service';
import { MessageController } from './message.controller';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        imports: [UserModule,],
        name: Message.name,
        collection: 'Messages',
        useFactory: (userService: UserService) => {
          const schema = MessageSchema;
          // schema.post('save', async function (doc) {
          //   try {
          //     await userService.update(doc.owner, {
          //       business: doc._id
          //     });
          //   } catch (error) {
          //     console.log(error);
          //   }
          // });
          return schema;
        },
        inject: [UserService],
      },
    ]),
  ],
  controllers: [MessageController]
})
export class MessageModule { }
