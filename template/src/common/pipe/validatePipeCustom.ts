import { ValidationError, ValidationPipe } from '@nestjs/common'

export default class ValidatePipeCustom extends ValidationPipe {
  protected flattenValidationErrors(validationErrors: ValidationError[]): any[] {
    const errorInfo = validationErrors.map((it) => ({
      field: it.property,
      message: Object.values(it.constraints).shift(),
    }))
    return errorInfo
  }
}
