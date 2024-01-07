import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CapturePaymentDto {
  @ApiProperty()
  @IsString() @IsNotEmpty() @IsMongoId()
  debtID: string;

  @ApiProperty()
  @IsString() @IsNotEmpty() @IsMongoId()
  optionID: string;

  @ApiProperty()
  @IsString() @IsNotEmpty() @IsMongoId()
  orderID: string;
}

