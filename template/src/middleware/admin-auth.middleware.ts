import { ToolsService } from '@/common/tools.service'
import { AdminService } from '@/service/admin/admin.service'
import { Injectable, NestMiddleware } from '@nestjs/common'

import { Request, Response } from 'express'
import { ConfigService } from 'src/common/config.service'
const whiteList = ['/login', '/message']
@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private adminService: AdminService,
    private readonly tools: ToolsService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    const path: string = req.originalUrl
    if (whiteList.some((it) => path.includes(it))) {
      return next()
    }
    //判断是否登录
    //获取session中的用户信息
    const userInfo = (req.session as any).userInfo
    if (userInfo && userInfo.username) {
      //1.获取角色
      //2.获取权限
      //3.获取当前访问的url的权限id
      //4.判断是否能访问
      if (userInfo.is_super || (await this.adminService.checkAuth(req))) next()
      else {
        console.log('没有权限访问')
        this.tools.error({ result: '没有权限访问' })
      }
    } else {
      next()

      //res.redirect(`/${this.config.res.admin}/login`)
    }
  }
}
