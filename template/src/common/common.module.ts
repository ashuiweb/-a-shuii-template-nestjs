import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer' //Multer 是处理 multipart/form-data 的 node.js 中间件，主要用于上传文件
import { extname } from 'path'
import { CacheService } from './cache.service'
import { app, res } from './config'
import { ConfigService } from './config.service'
import { EmailService } from './email.service'
import { PayService } from './pay.service'
import { PrismaService } from './prisma.service'
import { ToolsService } from './tools.service'
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [app, res],
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, //60s
    }),
    MulterModule.registerAsync({
      useFactory() {
        return {
          storage: diskStorage({
            //文件储存位置
            destination: 'public/uploads',
            //文件名定制
            filename: (req, file, callback) => {
              const path = Date.now() + '-' + Math.round(Math.random() * 1e10) + extname(file.originalname)
              callback(null, path)
            },
          }),
        }
      },
    }),
  ],

  providers: [ConfigService, CacheService, PrismaService, ToolsService, EmailService, PayService],
  exports: [ConfigService, CacheService, PrismaService, ToolsService, EmailService, PayService],
})
export class CommonModule {}
