import resConfig from '@/common/config/res'
import { ToolsService } from '@/common/tools.service'
import { AdminService } from '@/service/admin/admin.service'
import { RoleService } from '@/service/admin/role.service'
import { Body, Controller, Get, Param, Post, Query, Render } from '@nestjs/common'
import { ManagerDto } from './dto/add.dto'
import { EditManagerDto } from './dto/edit.dto'
const resConfigData = resConfig()

@Controller(`${resConfigData.admin}/manager`)
export class ManagerController {
  constructor(
    private service: AdminService,
    private roleService: RoleService,
    private tools: ToolsService,
  ) {}
  @Get()
  @Render('admin/manager/index')
  async index() {
    const list = await this.service.model.aggregate([
      {
        $lookup: {
          from: 'role',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
    ])

    return { list }
  }

  @Get('add')
  @Render('admin/manager/add')
  async add() {
    const roles = await this.roleService.find({})
    return {
      roles,
    }
  }

  @Post('doAdd')
  async doAdd(@Body() body: ManagerDto) {
    const data = await this.service.find({ username: body.username })
    if (data.length) {
      this.tools.error({ title: '管理员名称已存在' })
    }
    console.log(body.role_id)
    body.password = this.tools.md5(body.password)
    const result = await this.service.add(body)
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/manager`)
    } else {
      this.tools.error({ resule: '添加失败' })
    }
  }

  @Get('edit')
  @Render('admin/manager/edit')
  async edit(@Query() query) {
    const id = query.id
    const roles = await this.roleService.find({})
    const res = await this.service.find({ _id: id })
    const data = res.length ? res[0] : {}
    return { roles, data }
  }

  @Post('doEdit/:id')
  async doEdit(@Body() body: EditManagerDto, @Param('id') id: string) {
    const data = await this.service.find({ username: body.username })
    if (data.length) {
      if (data[0]._id.toString() !== id) this.tools.error({ title: '账号已存在' })
    }
    if (!body.password) delete body.password
    else body.password = this.tools.md5(body.password)
    console.log(body)
    const result = await this.service.save({ _id: id }, body)
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/manager`)
    } else {
      this.tools.error({ result: '修改失败' })
    }
  }

  @Get('delete')
  async delete(@Query('id') id: string) {
    const result = await this.service.deleteLeaveOne({ _id: id })
    if (result) {
      this.tools.success('操作成功', `/${this.tools.getConfig('admin')}/manager`)
    } else {
      this.tools.error({ resule: '删除失败' })
    }
  }
}
