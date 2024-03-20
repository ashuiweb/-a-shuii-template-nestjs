import { UseGuards, applyDecorators } from '@nestjs/common'
import { AdminGuard } from '../guard/admin.guard'
import { Auth } from './auth'

export function Admin() {
  return applyDecorators(Auth(), UseGuards(AdminGuard))
}
