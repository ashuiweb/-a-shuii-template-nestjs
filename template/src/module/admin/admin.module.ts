import resConfig from '@/common/config/res'

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { AdminAuthMiddleware } from '../../middleware/admin-auth.middleware'

import { LoginController } from './login/login.controller'
import { MainController } from './main/main.controller'
import { ManagerController } from './manager/manager.controller'
import { MessageController } from './message.controller'

import { MulterModule } from '@nestjs/platform-express'
import * as dayjs from 'dayjs'
import * as fs from 'fs-extra'

import { diskStorage } from 'multer'
import { extname } from 'path'
import { AccessController } from './access/access.controller'

import { ResourceController } from './resource/resource.controller'
import { RoleController } from './role/role.controller'
import { UploadController } from './upload.controller'

const resConfigData = resConfig()

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
  controllers: [
    MainController,
    LoginController,
    ManagerController,
    MessageController,
    RoleController,
    AccessController,

    ResourceController,
    UploadController,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes(resConfigData.admin)
  }
}
