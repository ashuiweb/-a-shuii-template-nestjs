import resConfig from '@/common/config/res'
import { Controller, applyDecorators } from '@nestjs/common'
const resConfigData = resConfig()

export function AdminController(path: string = '') {
  return applyDecorators(Controller(`${resConfigData.admin}/${path}`))
}
