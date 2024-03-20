import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Response } from 'express'
import { Observable } from 'rxjs'
import { POLICY_KEY } from '../decorator/policy.decorator'

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {} //注入反射
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    //context.getHandler() 上下文的方法 因为我们的装饰器是加在方法上的。
    const { policy, action } = this.reflector.get<{ policy: any; action: string }>(POLICY_KEY, context.getHandler())
    const methodName = action || context.getHandler().name
    const request = context.switchToHttp().getRequest() as Request
    const response = context.switchToHttp().getResponse() as Response
    // const policyInstance = new policy(request, this.config)
    return policy[methodName](request, response)
  }
}
