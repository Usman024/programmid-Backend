import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/entities/user.entity';
import { ChatSchema } from './entities/chat.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema, collection: 'Chats' },
      { name: 'User', schema: UserSchema, collection: 'Users' }, // adding MaterialSchema here
    ]),
  ]
})
export class ChatModule { }
