import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Length, IsPhoneNumber, IsNotEmpty, IsISO8601, IsUrl, IsEnum, IsDate } from "class-validator";
import { Role } from "src/auth/role.enum";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString() @IsString()
  password: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  suffix: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString() @Length(9, 9)
  ssn: string;

  @ApiProperty()
  @IsString() @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsEnum(Role, {
    message: `Field 'role' must be a valid role: ['${Role.DEBTOR}', '${Role.CREDITOR}']`
  })
  role: Role;

  @ApiProperty()
  @IsISO8601()
  dateOfBirth: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  displayPictureSecureURL?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  displayPicturePublicID?: string;

}
