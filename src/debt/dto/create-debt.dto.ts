import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsISO8601, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator";

export class CreateDebtDto {
    @ApiProperty()
    @IsNotEmpty() @IsString()
    issuer: string;

    @ApiProperty()
    @IsNotEmpty() @IsString()
    issuerAccountID: string;

    @ApiProperty()
    @IsISO8601()
    dateOfOrigination: Date;

    @ApiProperty()
    @IsISO8601()
    dateOfChargedOff: Date;

    @ApiProperty()
    @IsISO8601()
    dateOfLastPayment: Date;

    @ApiProperty()
    @IsNumber()
    originalInterestRate: number

    @ApiProperty()
    @IsPositive()
    principal: number

    @ApiProperty()
    @IsNumber() @IsPositive()
    currentInterestDue: number;

    @ApiProperty()
    @IsOptional()
    @IsMongoId()
    creditor: string;

    @ApiProperty()
    @IsNotEmpty() @IsString() @Length(9, 9)
    ssn: string;

    @ApiProperty()
    @IsNotEmpty() @IsString() @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty() @IsString()
    name: string;



    // @ApiProperty()
    // @IsArray()
    // paymentDates: any[];

    @ApiProperty()
    @IsNotEmpty() @IsString()
    phone: string;

    @ApiProperty()
    @IsNotEmpty() @IsNumber() @IsPositive()
    balance: number;

}
