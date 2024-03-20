import { AdminController } from '@/common/decorator/adminController'
import { AccessType } from '@/common/dictionary/dict'
import { SessionType } from '@/common/types/session'
import { AccessService } from '@/service/admin/access.service'
import { RoleService } from '@/service/admin/role.service'
import { Get, Render, Session } from '@nestjs/common'

@AdminController()
export class MainController {
  constructor(
    private service: RoleService,
    private readonly access: AccessService,
  ) {}

  @Get()
  @Render('admin/index')
  async index(@Session() session: SessionType) {
    //获取所有权限
    const authList = await this.access.accessList()

    const deepHandleAccess = (authList: any[]) => {
      const result = []
      while (authList.length) {
        const item = authList.shift()
        if (item.modules && item.modules.length) {
          item.modules = deepHandleAccess(item.modules)
        }
        if (
          [AccessType.模块, AccessType.菜单].includes(item.type) &&
          (session.userInfo.is_super || session.authAccessIds.includes(item._id.toString()))
        ) {
          result.push(item)
        }
      }
      return result
    }

    const menuData = deepHandleAccess(authList)

    return { menuData }
  }
  @Get('welcome')
  @Render('admin/welcome')
  welcome() {
    return {}
  }
}
