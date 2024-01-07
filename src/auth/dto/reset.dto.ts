import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty, MinLength } from "class-validator";

export class ResetDto {
  @ApiProperty()
  @MinLength(10) @IsNotEmpty()
  password: string;
  
  @ApiProperty()
  @IsJWT()
  resetToken: string;
}
