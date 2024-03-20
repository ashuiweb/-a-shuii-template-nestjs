import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Role, RoleSchema } from 'src/schema/role.schema'
import { RoleAccessSchema } from 'src/schema/roleAccess.schema'
import { BaseService } from './base.service'
@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectModel('Role') public model: Model<typeof RoleSchema>,
    @InjectModel('RoleAccess') public roleAccessModel: Model<typeof RoleAccessSchema>,
  ) {
    super()
  }

  // 授权
  async roleAuth(role_id: string, access_ids: string[]) {
    //先清除再新增
    await this.roleAccessModel.deleteMany({ role_id })
    //新增多个
    const data = access_ids.map((it) => ({
      access_id: it,
      role_id: role_id,
    }))
    try {
      return await this.roleAccessModel.insertMany(data)
    } catch (error) {
      return null
    }
  }
}
