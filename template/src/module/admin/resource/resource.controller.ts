import resConfig from '@/common/config/res'

import { ResourceService } from '@/service/admin/resource.service'
import { Controller, Get, Render } from '@nestjs/common'
import AdminBaseController from '../adminBase.controller'
const resConfigData = resConfig()
const name = 'resource'
@Controller(`${resConfigData.admin}/${name}`)
export class ResourceController extends AdminBaseController {
  name = name
  constructor(private service: ResourceService) {
    super(service)
  }
  @Get()
  @Render(`admin/${name}/index`)
  async index() {
    const list = await this.service.list({})

    return { list, name }
  }

  @Get('clean')
  async clean() {
    const result = await this.service.cleanUp()
    this.handlerResult(result)
  }
  /*
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
    const res = await this.service.find({ _id: id })
    const data = res.length ? res[0] : {}
    return { data } 
  }

  @Post('doEdit/:id')
  async doEdit(@Body() body: AccessDto, @Param('id') id: string) {
    if (!body.module_id) body.module_id = 0
    else body.module_id = new Types.ObjectId(body.module_id)
    const result = await this.service.save({ _id: id }, body)
    this.handlerResult(result)
  }*/
}
