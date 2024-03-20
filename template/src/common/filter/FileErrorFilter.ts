import { ArgumentsHost, Catch, ExceptionFilter, PayloadTooLargeException } from '@nestjs/common'
import { Response } from 'express'
const errorMessage = {
  'File too large': '文件大小超过限制',
}
@Catch(PayloadTooLargeException)
export class FileErrorFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp() //获取http上下文
    const resp = ctx.getResponse() as Response
    const responseObj = exception.getResponse() as any
    console.log(responseObj)
    responseObj.message = errorMessage[responseObj.message]
    return resp.status(responseObj.statusCode).json(responseObj)
  }
}
