import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Repayment } from '../repayment.enum';
import { CreateDebtDto } from './create-debt.dto';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {
  @ApiProperty()
  @IsArray()
  @IsOptional()
  paymentDates: any[];

  @ApiProperty()
  @IsEnum(Repayment, {
    message: `Field 'repaymentOption' must be a valid role: ['${Repayment.HUNDRED_PERCENT}', '${Repayment.SEVENTY_FIVE_PERCENT}', '${Repayment.FIFTY_PERCENT}', '${Repayment.TWENTY_FIVE_PERCENT}']`,
  })
  repaymentOption: number;
}
