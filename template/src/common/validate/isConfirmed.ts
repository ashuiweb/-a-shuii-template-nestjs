import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

export function IsComfirmed(
  validationOptions?: ValidationOptions,
  obj: { prefix: string; suffix: string } = { prefix: '', suffix: '_confirm' },
) {
  const { prefix, suffix } = obj
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsComfirmed',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: string, args: ValidationArguments) {
          const key = `${prefix}${args.property}${suffix}`
          return value === args.object[key]
        },
      },
    })
  }
}
