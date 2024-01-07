import { ApiProperty } from "@nestjs/swagger";
import { IsString, } from "class-validator";

export class CreateChatDto {

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  participants: string[];
}
