import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsISO8601, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Repayment } from "../repayment.enum";

export class CalculateDebtDto {

    @ApiProperty()
    @IsEnum(Repayment, {
        message: `Field 'repaymentOption' must be a valid role: ['${Repayment.HUNDRED_PERCENT}', '${Repayment.SEVENTY_FIVE_PERCENT}', '${Repayment.FIFTY_PERCENT}', '${Repayment.TWENTY_FIVE_PERCENT}']`,
    })
    repaymentOption: number;

    @ApiProperty()
    @IsNotEmpty() @IsNumber() @IsPositive()
    balance: number;

    @ApiProperty()
    @IsISO8601()
    dateOfChargedOff: Date;

}
