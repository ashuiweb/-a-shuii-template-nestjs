import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const FromReq = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const res = data ? request[data] || null : request
  return res
})

export const CurrentUser = () => FromReq('user')
