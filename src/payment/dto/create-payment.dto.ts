import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty()
  @IsString() @IsNotEmpty() @IsMongoId()
  debtID: string;
}

