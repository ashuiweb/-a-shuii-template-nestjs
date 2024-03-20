import { AdminController } from '@/common/decorator/adminController'

import { AccessService } from '@/service/admin/access.service'
import { RoleService } from '@/service/admin/role.service'
import { Body, Get, Param, Post, Query, Render } from '@nestjs/common'
import 'reflect-metadata'
import AdminBaseController from '../adminBase.controller'
import { AddRoleDto } from './dto/add.dtp'
const name = 'role'
@AdminController(`role`)
export class RoleController extends AdminBaseController {
  name = name
  constructor(
    private service: RoleService,
    private readonly access: AccessService,
  ) {
    super(service)
  }

  @Get()
  @Render('admin/role/index')
  async index() {
    const list = await this.service.find({})

    return { list }
  }

  @Get('auth')
  @Render('admin/role/auth')
  async auth(@Query('id') id: string) {
    const [authList, checkedIds] = await Promise.all([this.access.accessList(), this.service.getAuth(id)])

    return { authList, id, checkedIds }
  }
  @Post('doAuth/:id')
  async doAuth(@Param('id') id: string, @Body() data) {
    const { access_id } = data
    const result = await this.service.roleAuth(id, access_id)
    this.handlerResult(result)
  }

  @Get('add')
  @Render('admin/role/add')
  async add() {
    return {}
  }

  @Post('doAdd')
  async doAdd(@Body() body: AddRoleDto) {
    const data = await this.service.find({ title: body.title })
    if (data.length) {
      this.tools.error({ title: '角色名称已存在' })
    }
    const result = await this.service.add(body)
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/role`)
    } else {
      this.tools.error({ resule: '添加失败' })
    }
  }
  @Get('edit')
  @Render('admin/role/edit')
  async edit(@Query() query) {
    const id = query.id
    const res = await this.service.find({ _id: id })
    const data = res.length ? res[0] : {}
    return { data }
  }
  @Post('doEdit/:id')
  async doEdit(@Body() body: AddRoleDto, @Param('id') id: string) {
    const data = await this.service.find({ title: body.title })
    if (data.length) {
      if (data[0]._id.toString() !== id) this.tools.error({ title: '角色名称已存在' })
    }
    const result = await this.service.save({ _id: id }, body)
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/role`)
    } else {
      this.tools.error({ resule: '修改失败' })
    }
  }

  @Get('delete')
  async delete(@Query('id') id: string) {
    const result = await this.service.delete({ _id: id })
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/role`)
    } else {
      this.tools.error({ resule: '删除失败' })
    }
  }
}
