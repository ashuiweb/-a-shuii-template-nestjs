import { UploadService } from '@/service/default/upload.service'
import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import * as dayjs from 'dayjs'
import * as fs from 'fs-extra'
import { IndexController } from './index/index.controller'

import { diskStorage } from 'multer'
import { extname } from 'path'

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory() {
        return {
          limits: { fieldNameSize: 100 },
          storage: diskStorage({
            //文件储存位置
            // destination: 'public/uploads/',
            destination: async (req, file, callback) => {
              let destination = 'public/uploads/' + dayjs().format('YYYY-MM-DD')
              try {
                await fs.ensureDir(destination)
              } catch (error) {
                console.log(error)
                destination = 'public/uploads/'
              } finally {
                callback(null, destination)
              }
            },
            //文件名定制
            filename: (req, file, callback) => {
              //解决中文名的问题
              const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8')
              const path =
                fileName.replace(/\.[^\.]+$/, '') + '-' + Math.round(Math.random() * 100000) + extname(fileName)

              callback(null, path)
            },
          }),
        }
      },
    }),
  ],
  controllers: [IndexController],
  providers: [UploadService],
})
export class DefaultModule {}
