import { ApiProperty } from "@nestjs/swagger";
import {  IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(10) @IsNotEmpty()
  password: string;

}
