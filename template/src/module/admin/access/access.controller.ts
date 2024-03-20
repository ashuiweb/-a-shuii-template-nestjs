import resConfig from '@/common/config/res'

import { AccessService } from '@/service/admin/access.service'
import { Body, Controller, Get, Param, Post, Query, Render } from '@nestjs/common'
import { Types } from 'mongoose'
import AdminBaseController from '../adminBase.controller'
import { AccessDto } from './dto/add.dto'
const resConfigData = resConfig()
const name = 'access'
@Controller(`${resConfigData.admin}/${name}`)
export class AccessController extends AdminBaseController {
  name = name
  constructor(private service: AccessService) {
    super(service)
  }
  @Get()
  @Render(`admin/${name}/index`)
  async index() {
    const list = await this.service.accessList()

    return { list }
  }

  @Get('add')
  @Render(`admin/${name}/add`)
  async add() {
    //获取所有的模块
    const moduleList = await this.service.find({ module_id: 0 }, 'name')
    return {
      moduleList,
    }
  }

  @Post('doAdd')
  async doAdd(@Body() body: AccessDto) {
    if (!body.module_id) body.module_id = 0
    else body.module_id = new Types.ObjectId(body.module_id)

    const result = await this.service.add(body)
    this.handlerResult(result, '/add')
  }

  @Get('edit')
  @Render(`admin/${name}/edit`)
  async edit(@Query() query) {
    const id = query.id
    //获取所有的模块
    const moduleList = await this.service.find({ module_id: 0 }, 'name')
    const res = await this.service.find({ _id: id })
    const data = res.length ? res[0] : {}
    return { moduleList, data }
  }

  @Post('doEdit/:id')
  async doEdit(@Body() body: AccessDto, @Param('id') id: string) {
    if (!body.module_id) body.module_id = 0
    else body.module_id = new Types.ObjectId(body.module_id)
    const result = await this.service.save({ _id: id }, body)
    this.handlerResult(result)
  }
}
