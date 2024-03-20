import { Controller, Get, Post, Render, Request, Res, Session } from '@nestjs/common'
import { Body } from '@nestjs/common/decorators'
import { Response } from 'express'
import { ConfigService } from 'src/common/config.service'
import { ToolsService } from 'src/common/tools.service'
import { SessionType } from 'src/common/types/session'

import resConfig from '@/common/config/res'
import { AdminService } from './../../../service/admin/admin.service'
import { LoginDto } from './dto/login.dto'
const resConfigData = resConfig()

@Controller(`${resConfigData.admin}/login`)
export class LoginController {
  constructor(
    private readonly tools: ToolsService,
    private readonly adminService: AdminService,
    private readonly config: ConfigService,
  ) {}
  @Get()
  @Render('admin/login')
  async index() {
    return {}
  }
  @Get('code')
  getCode(@Request() req, @Res() res) {
    const svgCaptcha = this.tools.captcha(this.config.app.captchaLoginLength)
    //设置session
    req.session.code = svgCaptcha.text

    res.type('image/svg+xml')

    res.send(svgCaptcha.data)
  }

  @Post('doLogin')
  async doLogin(@Body() data: LoginDto, @Session() session: SessionType) {
    if (!session.code || (session.code as string).toUpperCase() !== data.code.toUpperCase()) {
      this.tools.error({ code: '验证码错误' })
    }
    const res = await this.adminService.find({ username: data.username, password: this.tools.md5(data.password) })
    if (res.length > 0) {
      const userInfo = res[0]
      session.userInfo = userInfo
      session.authAccessIds = await this.adminService.getAuth(userInfo.role_id)
      this.tools.success('操作成功', `/${resConfigData.admin}`)
    } else {
      this.tools.error({ username: '用户名或密码不正确' })
    }
  }

  @Get('out')
  loginOut(@Res() res: Response, @Session() session: SessionType) {
    session.userInfo = null
    res.redirect(`/${this.config.res.admin}/login`)
  }
}
