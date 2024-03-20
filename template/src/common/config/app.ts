import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  name: 'nestShop',
  TOKEN_SECRET: 'ashuiweb-backer',
  EXPIRESIN: '10d',
  captchaLoginLength: 2,
  pageSize: 3,
}))
