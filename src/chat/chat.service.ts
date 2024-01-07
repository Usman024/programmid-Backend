import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat, ChatDocument } from './entities/chat.entity';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(Chat.name) private readonly model: Model<ChatDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async create(createChatDto: CreateChatDto) {
    const existingChat = await this.model.findOne({
      participants: {
        $all: createChatDto.participants,
      },
      type: "private"
    }).populate({
      path: "participants",
      model: this.userModel,
      select: ["email", "displayPictureUrl", "name"]
    });

    console.log("pre cja");

    if (existingChat && createChatDto.type == "private") {
      return existingChat;
    }

    // console.log("chat");

    // createChatDto.participants.forEach(async (participant) => {
    //   const user = await this.model.findOne({
    //     $or: [
    //       { '_id': participant },
    //       { 'ssn': participant }
    //     ]
    //   });
    //   console.log(user);
    //   if (!user) throw new NotFoundException('User does not exist!');
    // });

    // console.log("got out");

    return (await this.model.create(createChatDto)).populate({
      path: "participants",
      model: this.userModel,
      select: ["email", "displayPictureUrl", "name"]
    });
  }

  findAll() {
    return this.model.find()
      .skip(0)
      .limit(20)
      .populate({
        path: "participants",
        model: this.userModel,
        select: ["email", "displayPictureUrl", "name"]
      });
  }

  findMyChats(userID: string) {
    return this.model.find({
      participants: userID
    })
      .populate({
        path: "participants",
        model: this.userModel,
        select: ["email", "displayPictureUrl", "name"]
      });
  }

  findOne(id: string) {
    return this.model.findById(id)
      .populate({
        path: "participants",
        model: this.userModel,
        select: ["email", "displayPictureUrl", "name"]
      });
  }

  update(id: string, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: string) {
    return `This action removes a #${id} chat`;
  }
}
