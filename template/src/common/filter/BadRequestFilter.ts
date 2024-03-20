import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
import { Request, Response } from 'express'
import { ConfigService } from '../config.service'
import { SuccessException } from '../exception/successException'
import { SessionType } from '../types/session'
//接收异常类型
@Catch(BadRequestException, SuccessException)
export class ValidateExceptionFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}
  catch(exception: BadRequestException | SuccessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp() //获取http上下文
    const resp = ctx.getResponse() as Response
    const req = ctx.getRequest() as Request
    const responseObj = exception.getResponse() as any
    const session = req.session as unknown as SessionType
    session.message = { message: responseObj.message, url: req.originalUrl }

    if (exception instanceof BadRequestException && process.env.OUTPUT_ERR === 'json')
      return resp.status(responseObj.statusCode).json(responseObj)
    if (exception instanceof SuccessException && process.env.OUTPUT_OK === 'json')
      return resp.status(responseObj.statusCode || 200).json(responseObj)
    else {
      if (req.originalUrl.startsWith(`/${this.config.res.admin}/`))
        return exception instanceof BadRequestException
          ? resp.redirect(`/${this.config.res.admin}/message/err`)
          : resp.redirect(`/${this.config.res.admin}/message/ok`)
      return resp.status(responseObj.statusCode || 200).json(responseObj)
    }
  }
}
