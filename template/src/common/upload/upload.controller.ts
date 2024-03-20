import { Controller, Post, UploadedFile, UploadedFiles } from '@nestjs/common'
import { Upload, Uploads } from './upload.decorator'

@Controller('upload')
export class UploadController {
  @Post('image')
  @Upload({ limit: 2, type: 'image' })
  image(@UploadedFile() file: Express.Multer.File) {
    return file
  }

  @Post('images')
  @Uploads({ limit: 2, type: 'image' })
  images(@UploadedFiles() files: Array<Express.Multer.File>) {
    return files
  }
}
