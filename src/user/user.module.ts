import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { ChatModule } from 'src/chat/chat.module';
import { MessageModule } from 'src/message/message.module';
import { DebtModule } from 'src/debt/debt.module';
import { DebtSchema } from 'src/debt/entities/debt.entity';
import { ChatSchema } from 'src/chat/entities/chat.entity';
import { MessageSchema } from 'src/message/entities/message.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema, collection: 'Users' },
      { name: 'Debt', schema: DebtSchema, collection: 'Debts' },
      { name: 'Chat', schema: ChatSchema, collection: 'Chats' },
      { name: 'Message', schema: MessageSchema, collection: 'Messages' },
    ]),
  ],
  exports: [UserService]
})
export class UserModule { }
