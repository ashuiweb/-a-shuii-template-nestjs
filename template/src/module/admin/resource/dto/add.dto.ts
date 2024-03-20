import { AccessType } from '@/common/dictionary/dict'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, Length, ValidateIf } from 'class-validator'

export class AccessDto {
  @IsNotEmpty({ message: '名称不能为空' })
  @Length(2, 10, { message: '长度为2-10位' })
  name: string

  @IsEnum(AccessType, {
    message:
      '类型只能是' +
      Object.values(AccessType)
        .filter((it) => !isNaN(+it))
        .join('|') +
      '中的一个',
  })
  @ValidateIf((o) => o.type !== '')
  @Type(() => Number)
  type: number

  url: string

  @Transform((data) => {
    if (!data.value) return Number(data.value)
    return data.value
  })
  module_id: any

  @Transform((data) => (isNaN(+data.value) ? 0 : +data.value))
  sort: number

  description: string
}
