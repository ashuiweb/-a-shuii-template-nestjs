/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ToolsService } from '@/common/tools.service'
import { UpdateService } from '@/service/admin/update.service'
import { Body, Get, Inject, Post, Query } from '@nestjs/common'

const blackList = ['user_wallet']
export default class AdminBaseController {
  name: string
  @Inject(ToolsService)
  public tools: ToolsService
  @Inject(UpdateService)
  public update: UpdateService
  constructor(public currentService) {}

  handlerResult(result, path = '', root = false) {
    const repath = `${root ? '' : '/' + this.name}`
    let url = `/${this.tools.getConfig('admin')}${repath}${path}`
    if (result && result.session && result.session.referer) {
      url = result.session.referer
      result.session.referer = ''
    }
    if (result) {
      this.tools.success('操作成功', url)
    } else {
      this.tools.error({ err: '操作失败' })
    }
  }

  @Get('delete')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(@Query('id') id: string, _refId?: string) {
    const result = await this.currentService.delete({ _id: id })
    this.handlerResult(result)
  }

  @Get('toggleStatus')
  async toggleStatus(@Query('id') id: string) {
    await this.currentService.toggleStatus({ _id: id })
  }

  @Get('setSort')
  async setSort(@Query('id') id: string, @Query('sort') sort: string) {
    if (isNaN(+sort)) {
      return this.tools.error({ sort: '必须是数字' })
    }
    await this.currentService.setSort({ _id: id }, +sort)
  }

  @Post('setValue')
  async setValue(@Body() body: { key: string; oldValue: any; newValue: any }) {
    if (blackList.includes(this.name)) return
    await this.currentService.model.updateOne(
      //@ts-ignore
      body._id ? { _id: body._id } : { [body.key]: body.oldValue },
      {
        $set: {
          //@ts-ignore
          [body.key]: body.newValue,
        },
      },
    )
  }
  @Post('setRecommend')
  async setRecommend(@Body() body: { id: string; recommend: number[] }) {
    await this.currentService.model.updateOne(
      //@ts-ignore
      { _id: body._id },
      {
        $set: {
          //@ts-ignore
          recommend: body.recommend,
        },
      },
    )
  }

  //拿到自增数后再更新
  async getCount(collectionName: string, step = 1) {
    let id = 0

    let data = await this.update.model.findOne({ name: collectionName })
    if (!data) {
      data = await this.update.add({ name: collectionName })
    } else {
      //@ts-ignore
      id = data.id
    }
    return [
      id + step,
      async (description?: string) =>
        await this.update.model.updateOne(
          { name: collectionName },
          {
            $set: {
              id: id + step,

              //@ts-ignore
              description: description || data.description,
            },
          },
        ),
    ] as const
  }
}
