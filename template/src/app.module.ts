import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppService } from './app.service'
import { CommonModule } from './common/common.module'

import { APP_FILTER } from '@nestjs/core'
import { ValidateExceptionFilter } from './common/filter/BadRequestFilter'
import { FileErrorFilter } from './common/filter/FileErrorFilter'
import { ConfigResMiddleware } from './middleware/config-res.middleware'
import { AdminModule } from './module/admin/admin.module'
import { ApiModule } from './module/api/api.module'
import { DefaultModule } from './module/default/default.module'

import { PublicModule } from './module/public/public.module'

@Module({
  imports: [
    CommonModule,
    AdminModule,
    DefaultModule,
    ApiModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),

    PublicModule,
  ],

  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ValidateExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: FileErrorFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ConfigResMiddleware)
      .exclude('/api/*', '/public/*', '/template/*')
      .forRoutes({ path: '*', method: RequestMethod.GET })
  }
}
