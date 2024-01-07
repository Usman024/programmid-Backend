import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {

    @ApiProperty()
    @IsOptional() @IsString() @IsNotEmpty()
    name?: string;

    @ApiProperty()
    @IsOptional() @IsString() @IsNotEmpty()
    suffix?: string;

    @ApiProperty()
    @IsOptional() @IsEmail()
    email?: string;

    @ApiProperty()
    @IsOptional() @IsString() @IsNotEmpty()
    phone?: string;

    @ApiProperty()
    @IsOptional() @IsString() @IsNotEmpty()
    address?: string;

}
