import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, IsPhoneNumber, IsNotEmpty, IsISO8601, IsUrl, IsEnum, IsNumber } from "class-validator";
import { Role } from "src/auth/role.enum";

export class CreateExpenseDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber() @IsNotEmpty()
  monthly: number;

  @ApiProperty()
  @IsNumber() @IsNotEmpty()
  yearly: number;
}
