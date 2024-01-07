import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { Model, Types } from 'mongoose';
import mongoose from 'mongoose';
import { randText } from '@ngneat/falso';
@Injectable()
export class MessageService {

  constructor(
    @InjectModel(Message.name) private readonly model: Model<MessageDocument>,
  ) { }

  create(createMessageDto: CreateMessageDto) {
    return this.model.create(createMessageDto);
  }

  findAll() {
  }

  findMyMessages(userID: string) {
    console.log(userID)
    return this.model.aggregate().match({
      $or: [
        { from: userID },
        { to: userID },
      ]
    }).group({
      _id: "$chatID",
    })
  }

  async findChatMessages(chatID: string, userID: string, skip: number) {
    const messages = await this.model.find({
      chatID,
      participants: userID
    })
      .limit(30)
      .skip(skip)
      .sort({ createdAt: -1 })

    return messages;
  }

  findOne(id: string) {
    return `This action returns a #${id} chat`;
  }

  update(id: string, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  // async seedMessages(to: string, from: string, chatID: string, iterations: number) {
  //   let messages = [];
  //   for (let i = 0; i < iterations; i++) {
  //     messages.push({
  //       chatID,
  //       from,
  //       to,
  //       type: "text",
  //       text: randText({ length: 75}).join(' '),
  //     });
  //   }
  //   return await this.model.insertMany(messages);
  // }
}
