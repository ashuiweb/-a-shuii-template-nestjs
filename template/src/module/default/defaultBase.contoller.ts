/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ToolsService } from '@/common/tools.service'

import { Inject } from '@nestjs/common'

export default class DefaultBaseController {
  name: string
  @Inject(ToolsService)
  public tools: ToolsService

  constructor(public currentService) {}

  handlerResult(result, message?: any) {
    if (result) {
      this.tools.success(message)
    } else {
      this.tools.error({ err: message || '服务器错误' })
    }
  }
}
