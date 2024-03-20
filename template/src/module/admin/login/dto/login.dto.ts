import appConfig from '@/common/config/app'
import { IsNotEmpty, Length, Matches } from 'class-validator'
const appConfigData = appConfig()
const { captchaLoginLength } = appConfigData
export class LoginDto {
  @Matches(/^[a-z1-2]+$/i, { message: '用户名只能是字母或数字' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string
  @IsNotEmpty({ message: '密码不能为空' })
  password: string
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(captchaLoginLength, captchaLoginLength, { message: `请输入${captchaLoginLength}位验证码` })
  code: string
}
