import { Prop, Schema } from "@nestjs/mongoose";

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true, versionKey: false })
export class Contact {
  @Prop({ required: true, type: String, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  name: string;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  title: string;

  @Prop({ required: true, type: String, lowercase: true, trim: true })
  description: string;
}
