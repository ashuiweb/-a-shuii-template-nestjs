import { UseGuards, applyDecorators } from '@nestjs/common'

import { Request, Response } from 'express'
import { PolicyGuard } from '../guard/policy.guard'
import { SessionType } from '../types/session'
import { IPolicy, Policy } from './policy.decorator'

export function ReqGuard(policy: IPolicy, action?: string) {
  return applyDecorators(Policy(policy, action), UseGuards(PolicyGuard))
}

export function LoginGuard() {
  return applyDecorators(Policy(User, 'checkLogin'), UseGuards(PolicyGuard))
}

export class User {
  static async checkLogin(request: Request, response: Response) {
    const session = request.session as unknown as SessionType
    if (!session.userData) {
      response.redirect('/user')
      return false
    }
    return true
  }
}
