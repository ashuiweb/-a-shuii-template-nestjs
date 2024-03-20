import { Length, ValidateIf } from 'class-validator'
import { ManagerDto } from './add.dto'

export class EditManagerDto extends ManagerDto {
  @ValidateIf((o) => o.password !== '')
  @Length(6, 20, { message: '密码长度为6-201位' })
  password: string
}
