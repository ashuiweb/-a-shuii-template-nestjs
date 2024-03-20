import resConfig from '@/common/config/res'
import { Controller, Get, Render, Session } from '@nestjs/common'
import { SessionType } from 'src/common/types/session'
const resConfigData = resConfig()
@Controller(`${resConfigData.admin}/message`)
export class MessageController {
  @Get('err')
  @Render(process.env.OUTPUT_ERR)
  err(@Session() session: SessionType) {
    return {
      ...session.message,
    }
  }
  @Get('ok')
  @Render(process.env.OUTPUT_OK)
  ok(@Session() session: SessionType) {
    return {
      ...session.message,
    }
  }
}
