import { HttpStatus } from '@nestjs/common/enums'
import { HttpException } from '@nestjs/common/exceptions'

export class SuccessException extends HttpException {
  constructor(message: { message: { message: string; redicect?: string } }) {
    super(message, HttpStatus.OK)
  }
}
