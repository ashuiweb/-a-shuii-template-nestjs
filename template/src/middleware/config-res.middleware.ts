import { SessionType } from '@/common/types/session'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { randomText } from './../common/utils'

import { Request, Response } from 'express'
import { ConfigService } from 'src/common/config.service'
import { ToolsService } from 'src/common/tools.service'

@Injectable()
export class ConfigResMiddleware implements NestMiddleware {
  constructor(
    private readonly tool: ToolsService,
    private readonly config: ConfigService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    // console.log(this.config.res)
    for (const key in this.config.res) {
      res.locals[key] = this.config.res[key]
    }
    // console.log(req.session)
    const session = req.session as unknown as SessionType
    session.userData = session.userData || null
    for (const key in req.session) {
      res.locals[key] = req.session[key]
    }
    res.locals.tool = this.tool
    res.locals.nonce = ''
    //如果访问的是用户路由需要生成随机值
    console.log(req.method)
    console.log(req.originalUrl)
    if (req.originalUrl.startsWith('/user') && req.method === 'GET' && session.userData) {
      if (session.userData) {
        console.log('生成随机值')
        const nonce = randomText(10)

        //5分钟
        await this.tool.setCache(
          nonce,
          { uid: session.userData.uid, _id: session.userData._id.toString(), src_id: session.userData.src_id },
          300000,
        )
        res.locals.nonce = nonce
      }
    }
    next()
  }
}
