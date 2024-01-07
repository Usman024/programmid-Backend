import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, versionKey: false })
export class Message {

  @Prop({ index: true, required: true, type: MongooseSchema.Types.ObjectId, ref: 'Chat' })
  chatID: Types.ObjectId

  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, enum: ['text', 'image', 'video', 'audio', 'file'] })
  type: string;

  @Prop({ trim: true })
  mediaSecureURL?: string;

  @Prop({ trim: true })
  mediaPublicID?: string;

  @Prop({ index: true, required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  to: Types.ObjectId

  @Prop({ index: true, required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  from: Types.ObjectId
}

export const MessageSchema = SchemaFactory.createForClass(Message);
