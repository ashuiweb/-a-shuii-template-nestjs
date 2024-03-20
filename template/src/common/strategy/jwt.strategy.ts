import { Injectable } from '@nestjs/common'

import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/common/prisma.service'
console.log(process.env.TOKEN_SECRET)
@Injectable()
/**
 *  'jwt' 名称 和 控制器的@UseGuards(AuthGuard('jwt'))对应
 */
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    const secretOrKey = 'ashuiweb-backer'
    console.log(process.env.TOKEN_SECRET, secretOrKey)
    super({
      //解析用户提交的header中的Bearer Token数据
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //加密码的 secret
      // secretOrKey: 'ashuiweb-backer',
      secretOrKey,
    })
  }

  //验证通过后自动调用这个方法获取用户资料，会把结果放到全局对象Requst上
  async validate({ id }) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }
}
