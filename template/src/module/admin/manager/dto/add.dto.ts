import { IsNotEmpty, Length, Matches, ValidateIf } from 'class-validator'

export class ManagerDto {
  @Matches(/^[a-z1-9]+$/i, { message: '用户名只能是字母或数字' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 20, { message: '密码长度为6-20位' })
  password: string
  @IsNotEmpty({ message: '角色不能为空' })
  role_id: string

  @Matches(/^(?:(?:\+|00)86)?1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  @ValidateIf((o) => o.mobile !== '')
  mobile: string

  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: '邮箱格式不正确' })
  @ValidateIf((o) => o.mobile !== '')
  email: string
}
