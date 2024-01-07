import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from 'src/auth/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({ required: true, type: String, unique: true, index: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, type: String, select: false })
    password: string;

    @Prop({ required: true, type: String, trim: true })
    suffix: string;

    @Prop({ required: true, type: String, trim: true })
    name: string;

    @Prop({ required: true, type: String, trim: true, select: false, unique: true })
    ssn: string;

    @Prop({ required: true, type: String, trim: true })
    phone: string;

    @Prop({ type: String, enum: [Role.DEBTOR, Role.CREDITOR] })
    role: string;

    @Prop({ default: false })
    emailVerified: boolean;

    @Prop({ default: true })
    phoneVerified: boolean;

    @Prop({ default: () => (Math.floor(100000 + Math.random() * 900000)).toString(), select: false })
    otp: string;

    @Prop({ default: false })
    banned: boolean;

    // @ApiHideProperty()
    @Prop({ type: String, trim: true, select: false })
    resetToken?: String;

    @Prop({ required: true, type: Date })
    dateOfBirth: Date;

    @Prop({ required: true, type: String })
    address: string;

    // @ApiHideProperty()
    @Prop({ type: String, trim: true, select: false })
    refreshToken?: String;

    @Prop({ type: String, trim: true, select: false })
    fcmToken?: string;

    @Prop({ type: String, trim: true })
    displayPictureSecureURL?: string;

    @Prop({ type: String, trim: true })
    displayPicturePublicID?: string;

    @Prop({ select: false })
    passwordResetCode: string;

    @Prop({
        type: [{
            title: String,
            monthly: Number,
            yearly: Number,
        }],
        default: [
            {
                title: "Food",
                monthly: 90,
                yearly: 1080,
            },
            {
                title: "Travel",
                monthly: 120,
                yearly: 1440,
            },
            {
                title: "Entertainment",
                monthly: 50,
                yearly: 600,
            }
        ],
        select: false
    })
    expenses: [];
}

export const UserSchema = SchemaFactory.createForClass(User);

