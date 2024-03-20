import { ToolsService } from '@/common/tools.service'
import { Controller, Get, Render } from '@nestjs/common'
@Controller()
export class IndexController {
  constructor(public tools: ToolsService) {}
  @Get()
  @Render(process.env.template + '/index')
  index() {
    return {}
  }

  @Get('email')
  async email() {
    const res = await this.tools.sendEmail({
      to: [
        { name: 'ashuiweb', email: 'ashuiweb@163.com' },
        { name: 'ashui', email: 'bangbangyang@yeah.net' },
      ],

      subject: '我是阿水测试',
      text: '我要测试一下发送邮件',
    })
    return res
  }
}
