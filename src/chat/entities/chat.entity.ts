import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true, versionKey: false })
export class Chat {
  @Prop({ required: true, enum: ['private', 'group'] })
  type: string;

  @Prop({ default: [] })
  participants?: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
