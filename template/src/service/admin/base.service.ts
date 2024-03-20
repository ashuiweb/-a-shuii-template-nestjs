import { ConfigService } from '@/common/config.service'
import { ToolsService } from '@/common/tools.service'
import { SessionType } from '@/common/types/session'
import { AccessSchema } from '@/schema/access.schema'
import { RoleAccessSchema } from '@/schema/roleAccess.schema'
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Request } from 'express'

import { Model } from 'mongoose'

@Injectable()
export class BaseService<T> {
  public model: Model<any>
  @Inject(ToolsService)
  public tools: ToolsService
  @InjectModel('RoleAccess')
  public roleAccessModel: Model<typeof RoleAccessSchema>
  @InjectModel('Access')
  public accessModel: Model<typeof AccessSchema>
  @Inject(ConfigService)
  protected readonly config: ConfigService
  constructor() {}
  find(where: Partial<T>, fields?: string) {
    return this.model.find(where as any, fields).sort({ sort: 1 })
  }
  count(where: Partial<T>) {
    return this.model.find(where as any).count()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async add(json: WhereType<T>, ..._args: any[]) {
    try {
      const data = new this.model(json)
      return await data.save()
    } catch (error) {
      console.log(error)
      return null
    }
  }
  // 修改数据
  async save(where: WhereType<T>, data: WhereType<T>) {
    try {
      return await this.model.updateOne(where as any, data)
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // 删除数据
  async delete(where: WhereType<T>): Promise<any> {
    try {
      return await this.model.deleteOne(where as any)
    } catch (error) {
      return null
    }
  }

  // 删除数据得留一个
  async deleteLeaveOne(where: WhereType<T>): Promise<any> {
    const length = await this.model.count()
    if (length === 1) {
      return this.tools.error({ result: '数据库中只剩一个数据，无法删除' })
    }
    try {
      return await this.model.deleteOne(where as any)
    } catch (error) {
      return null
    }
  }

  // 获取授权
  async getAuth(role_id: string, flag = true) {
    const authedObjs = await this.roleAccessModel.find({ role_id }, 'access_id')
    if (!flag) return authedObjs
    return authedObjs && authedObjs.length ? authedObjs.map((item: any) => item.access_id.toString()) : []
  }

  async checkAuth(req: Request) {
    //1.获取session
    const session = req.session as unknown as SessionType
    //2.获取权限
    const checkedIds = session.authAccessIds
    //3.获取当前访问的url的权限id
    const path: string = req.originalUrl.replace('/' + this.config.res.admin, '').split('?')[0]
    const auth = await this.accessModel.find({ url: path })
    try {
      console.log(path, auth[0], checkedIds, checkedIds.includes(auth[0]._id.toString()))
    } catch (error) {}

    //可以访问
    if (!auth || auth.length === 0 || checkedIds.includes(auth[0]._id.toString())) {
      console.log('可以访问')
      return true
    }
    console.log('禁止访问')
    return false
  }

  async toggleStatus(where: WhereType<T>): Promise<any> {
    try {
      return await this.model.updateOne(where as any, {
        $bit: {
          status: { xor: 1 },
        },
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async setSort(where: WhereType<T>, sort: number): Promise<any> {
    try {
      return await this.model.updateOne(where as any, {
        $set: {
          sort,
        },
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // 自关联无限级分类
  async deepSelfLevel(params: Partial<{ flat: boolean; select: string; where: any; field: string }>) {
    const { flat = false, select = '', where = {}, field = 'p_id' } = params

    let data: any[]
    if (select.includes('src_id') || (!select && 'src_id' in this.model.schema.paths)) {
      const selectArr = select ? `p_id _id sort ${select}`.trim().split(' ') : []
      const selectObj: any = {}
      selectArr.forEach((it) => {
        selectObj[it] = 1
      })
      const aggregateArr: any[] = [
        {
          $sort: {
            sort: 1,
          },
        },
        {
          $match: where as any,
        },
        {
          $project: selectObj,
        },
        {
          $lookup: {
            from: 'resource',
            let: { local_id: '$src_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$local_id'],
                  },
                },
              },
              {
                $project: {
                  path: 1,
                  _id: 1,
                },
              },
            ],
            as: 'resource',
          },
        },
      ]
      if (!selectArr.length) {
        aggregateArr.splice(2, 1)
      }
      data = await this.model.aggregate(aggregateArr).exec()
    } else {
      data = await this.model.find(where, `p_id _id sort ${select}`).lean()
    }

    //根据data数组中的p_id 做成树形结构 字段为children
    const reuslt: any[] = data.filter((it) => !it[field])

    const findChildren = (fathers: any[], data, level = 1) => {
      if (!fathers || !fathers.length) return
      fathers.forEach((father) => {
        //清理标记
        const removeIndexes: number[] = []
        data.forEach((child, index) => {
          if ((father && child[field].toString() === father._id.toString()) || child[field] === 0) {
            if (child[field].toString() === father._id.toString()) {
              child.level = level
              father.children = father.children || []
              father.children.push(child)
              // console.log(father.name + ':', father.children)
            }
            removeIndexes.push(index)
          }
        })
        //清理数据
        data = data.filter((_, index) => !removeIndexes.includes(index))
        father.children =
          father.children && father.children.length ? father.children.sort((a, b) => a.sort - b.sort) : []
      })

      if (data.length > 0) {
        level++
        fathers = fathers.map((it) => it && it.children).flat()
        findChildren(fathers, data, level)
      }
    }

    findChildren(reuslt, data)
    if (flat) {
      const _result = []
      const getResult = (list) => {
        list.forEach((item) => {
          _result.push(item)
          if (item.children && item.children.length > 0) {
            getResult(item.children)
            delete item.children
          }
        })
      }
      getResult(reuslt)
      return _result
    }
    return reuslt
  }
}
