import { Controller, Post, Query, Req } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {

    constructor(
        private readonly cloudinary: CloudinaryService 
    ) {}

    @Post()
    async create(
      @Query('folder') folder: string,
      @Req() req,
    ) {
        const data = await req.file()
        return this.cloudinary.uploadImage(await data.toBuffer(), folder);
    }
  
}
