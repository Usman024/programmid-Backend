import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: any,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {

    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream({ 
        format: 'webp', 
        folder: `god/${folder}`,
        exif: false,
        transformation: [
          { quality: 30 },
        ]
      }, (error, result) => {
        if (error) {
          return reject(error)
        };
        resolve(result);
      });
      streamifier.createReadStream(file).pipe(upload);
    });
  }
}
