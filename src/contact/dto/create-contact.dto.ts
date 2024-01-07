import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateContactDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @MinLength(10) @IsNotEmpty()
  title: string;

  @ApiProperty()
  @MaxLength(512) @IsNotEmpty()
  description: string;
}
