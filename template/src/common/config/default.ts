import { registerAs } from '@nestjs/config'
//需要传递给res.locals的配置
export default registerAs('default', () => ({
  //前端模板目录
  template_url: process.env.template,
}))
