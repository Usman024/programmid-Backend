import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Repayment } from '../repayment.enum';
import { CreateDebtDto } from './create-debt.dto';

export class DisputeDebtDto extends PartialType(CreateDebtDto) {
  @ApiProperty()
  @IsBoolean()
  dispute: boolean;

  @ApiProperty()
  @IsString()
  disputeReason: string;
}
