import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import * as admin from 'firebase-admin';
import { RedisService } from '@liaoliaots/nestjs-redis';

@WebSocketGateway({
  allowEIO3: true,
  namespace: "chat",
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*'
  }
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly chatService: MessageService,
    private readonly redisService: RedisService
  ) { }

  @WebSocketServer() io: Server;

  afterInit(server: any) { }

  async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {

    const { userId, token, fcm } = client.handshake.auth;

    if (!userId || !token) {
      client.send("userId, token and fcm all are required")
      client.disconnect();
    }

    await this.redisService.getClient().hset(userId, {
      accessToken: token,
      fcmToken: fcm || "",
      socketId: client.id,
    });
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log("Client disconnected", client.handshake.auth.userId);
    try {
      await this.redisService.getClient().hdel(client.handshake.auth.userId);
    } catch (error) {
    }
  }


  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto) {

    if (!createMessageDto.to || !createMessageDto.from) { return; }

    const receiver = await this.redisService.getClient().hgetall(createMessageDto.to);

    await this.chatService.create(createMessageDto);

    if (!receiver) { return; }

    console.log("Message send to", createMessageDto.to);
    
    console.log("Receiver", receiver);

    this.io.to(receiver?.socketId).emit('message', createMessageDto);

    if (receiver.fcmToken) {
      await admin.messaging().send({
        token: receiver.fcmToken,
        android: {
          notification: {
            title: 'New Message',
            body: createMessageDto.text,
          }
        },
        notification: {
          title: 'New Message',
          body: createMessageDto.text,
        },
      });
    }
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: string) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.chatService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: string) {
    return this.chatService.remove(id);
  }

}
