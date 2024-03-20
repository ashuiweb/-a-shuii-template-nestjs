import { MethodNotAllowedException, UseInterceptors, applyDecorators } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
export function Upload(data: { limit: number; type: 'image' | 'video' | 'audio' }, field = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(field, {
        limits: { fileSize: Math.round(data.limit * Math.pow(1024, 2)) }, //限制2M
        fileFilter(req: any, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) {
          if (!file.mimetype.includes(data.type)) callback(new MethodNotAllowedException('不支持的文件类型'), false)
          else {
            callback(null, true)
          }
        },
      }),
    ),
  )
}

export function Uploads(
  data: { limit: number; maxLength?: number; type: 'image' | 'video' | 'audio' },
  field = 'files',
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(field, data.maxLength || 10, {
        limits: { fileSize: Math.round(Math.pow(1024, 2) * data.limit) }, //限制2M
        fileFilter(req: any, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) {
          if (!file.mimetype.includes(data.type)) callback(new MethodNotAllowedException('不支持的文件类型'), false)
          else {
            callback(null, true)
          }
        },
      }),
    ),
  )
}
