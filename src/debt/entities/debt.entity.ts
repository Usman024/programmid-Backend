import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Repayment } from '../repayment.enum';

export type DebtDocument = Debt & Document;

@Schema({ timestamps: true, versionKey: false })
export class Debt {
    @Prop({ required: true, type: String, index: true, trim: true })
    issuer: string;

    @Prop({ required: true, type: String })
    issuerAccountID: string;

    @Prop({ required: true, type: Date })
    dateOfOrigination: Date;

    @Prop({ required: true, type: Date })
    dateOfChargedOff: Date;

    @Prop({ required: true, type: Date })
    dateOfLastPayment: Date;

    @Prop({ required: true, type: Number })
    originalInterestRate: number;

    @Prop({ required: true, type: Number })
    principal: number;

    @Prop({ required: true, type: Number })
    currentInterestDue: Number;

    @Prop({
        type: [{
            amount: Number,
            status: {
                type: String,
                enum: ['paid', 'pending', 'overdue'],
                default: 'pending'
            },
            date: String
        }],
    })
    payments: [];

    @Prop({ type: Number, default: 0 })
    discountedAmount: number;

    @Prop({ type: Number })
    dueAmount: number;

    @Prop({ type: Number })
    remainingBalance: number;

    @Prop({ required: true, type: Number })
    balance: number;

    @Prop({ required: false, type: String, enum: ['active', 'overdue', 'cancelled', 'completed'], default: "active" })
    status: string;

    @Prop({ required: true, type: String, index: true })
    ssn: string;

    @Prop({ required: true, type: String })
    email: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, type: String })
    phone: string;

    @Prop({ type: Number, enum: Repayment })
    repaymentOption: number;

    @Prop({ required: true, index: true, type: Types.ObjectId, ref: 'User' })
    creditor: string;

    @Prop({ required: false, type: Boolean, default: false })
    dispute: boolean;

    @Prop({ required: false, type: String, default: "" })
    disputeReason: string;

    @Prop({ required: false, type: Number, default: 5 })
    gracePeriodDays: number;

    @Prop({ required: false, default: [100, 75, 50, 25] })
    optionsAvailable: number[];

    @Prop({ required: true, type: Boolean, default: true })
    isEditable: boolean;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
