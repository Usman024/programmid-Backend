import { Controller, Get, Param, Post, Req, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@ApiTags('Message')
@Controller('message')
export class MessageController {

  constructor(
    private readonly messageService: MessageService
  ) { }

  @Post()
  createMessage(@Req() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get('my')
  getMyMessages(@Req() req) {
    return this.messageService.findMyMessages(req.user.sub);
  }

  @Get('/chat/:id')
  getChatMessages(
    @Param('id') chatID: string,
    @Query('skip') skip: number,
    @Req() req
  ) {
    return this.messageService.findChatMessages(chatID, req.user.sub, skip);
  }

  // @Post("/seed/:num")
  // seedMessages(
  //     @Param('num') num: number,
  //     @Req() req,
  //     @Body() createMessageDto: any
  // ) {
  //     return this.messageService.seedMessages(
  //         createMessageDto.to,
  //         req.user.sub,
  //         createMessageDto.chatID,
  //         num
  //     );
  // }
}
