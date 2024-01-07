import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from "class-validator";

enum MessageType {
  Text = "text",
  Audio = "audio",
  Image = "image",
  Video = "video",
  File = "file"
}
export class CreateMessageDto {
  @ApiProperty()
  @IsMongoId()
  chatID: string;

  @ApiProperty()
  @IsString() @IsNotEmpty() @MaxLength(512)
  text: string;

  @ApiProperty({
    enum: MessageType
  })
  @IsString() @IsEnum(MessageType, {
    message: `type must be a valid media type: [${Object.values(MessageType).join(', ')}]`
  })
  type: string;

  @ApiProperty()
  @IsOptional() @IsUrl()
  mediaSecureURL?: string;

  @ApiProperty()
  @IsOptional() @IsString() @IsNotEmpty()
  mediaPublicID?: string;

  @ApiProperty()
  @IsMongoId()
  to: string;

  @ApiProperty()
  @IsMongoId()
  from: string;
}
