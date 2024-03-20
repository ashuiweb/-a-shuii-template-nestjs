import { uploadAzure } from '@/common/upload/uploadAzure'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as Jimp from 'jimp'
import { Model, Types } from 'mongoose'
import { extname, resolve } from 'path'
import { Resource, ResourceSchema } from 'src/schema/resource.schema'
import { BaseService } from './base.service'

@Injectable()
export class ResourceService extends BaseService<Resource> {
  constructor(@InjectModel('Resource') public model: Model<typeof ResourceSchema>) {
    super()
  }

  async list(where: WhereType<Resource>) {
    return await this.model
      .aggregate([
        {
          $match: where as any,
        },

        {
          $lookup: {
            from: 'user',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$local_id', '$src_id'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  uid: 1,
                  name: 1,
                },
              },
            ],
            as: 'user',
          },
        },
      ])
      .exec()
  }

  async doSave(json: WhereType<Resource>, body: any) {
    if (body.id && !body.id.includes('_')) {
      //return this.save(json, body)
      // 修改数据
      //删除原来的数据
      const old = await this.model.findOne({ _id: new Types.ObjectId(body.id) })
      if (!old) return this.tools.error({ id: '错误的资源ID' })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const { sizes, path } = old
      const filesToDelete = []
      filesToDelete.push(path)
      if (sizes.length) {
        sizes.forEach((s) => {
          filesToDelete.push(this.tools.suffixPath(path as unknown as string, '_' + s))
        })
      }
      console.log(filesToDelete)
      //删除本地图片
      this.tools.removeLocalFile(filesToDelete)
      // 删除远程图片
      this.tools.removeRemoteFile(filesToDelete)
      json.sizes = sizes
      await uploadAzure(json.path)
      if (json.sizes && json.sizes.length) await this.generateSize(json.path, json.sizes)
      json.path = json.path.replace(/\\/g, '/').replace(/public\/uploads\//, '')

      await this.save({ _id: body.id }, json)
      return json
    } else {
      return this.add(json)
    }
  }

  async add(json: WhereType<Resource>) {
    try {
      await uploadAzure(json.path)
      if (json.sizes) await this.generateSize(json.path, json.sizes)
      json.path = json.path.replace(/\\/g, '/').replace(/public\/uploads\//, '')
      const data = new this.model(json)
      return await data.save()
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async generateSize(path, _sizes: string | string[] = '[]') {
    const localFilePath = resolve(__dirname, '../../../', path)
    let sizes: string[] = []
    if (typeof _sizes === 'string') sizes = JSON.parse(_sizes).map((it) => it.split('x').join('_'))
    else sizes = _sizes
    console.log(localFilePath, sizes, path)
    const fileName = path.replace(/\\/g, '/').replace(/public\/uploads\//, '')

    const image = await Jimp.read(localFilePath)
    const ext = extname(fileName)
    const _fileName = fileName.substring(0, fileName.length - ext.length)
    sizes.forEach((s) => {
      const [w, h] = s.split('_')
      image
        .cover(+w, +h)
        .quality(90)
        .getBuffer('image/' + image.getExtension().toLowerCase(), (err, buffer) => {
          if (!err) uploadAzure({ data: buffer, fileName: _fileName + `_${s}${ext}` })
        })
    })
  }

  //清理资源
  /**
   * 把没有用到的资源删除。
   * banner、goods_cate
   *
   */

  async cleanUp(): Promise<any> {
    const dataToDelete = await this.model
      .aggregate([
        {
          $lookup: {
            from: 'banner',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$src_id', '$$local_id'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: 'banner',
          },
        },
        {
          $lookup: {
            from: 'goods_cate',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$src_id', '$$local_id'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                },
              },
            ],
            as: 'goodsCate',
          },
        },
        {
          $lookup: {
            from: 'goods',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$src_id', '$$local_id'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
            as: 'goods',
          },
        },
        {
          $lookup: {
            from: 'goods',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$$local_id', '$pic_ids'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
            as: 'goods_pics',
          },
        },
        {
          $lookup: {
            from: 'goods',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$$local_id', '$content_pic_ids'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                },
              },
            ],
            as: 'goods_content_pics',
          },
        },
        {
          $lookup: {
            from: 'user',
            let: { local_id: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$$local_id', '$src_id'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  uid: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        // 添加 $match 阶段来过滤掉 banner 和 goodsCate 为空的数据
        {
          $match: {
            $and: [
              { 'banner.0': { $exists: false } },
              { 'goodsCate.0': { $exists: false } },
              { 'goods.0': { $exists: false } },
              { 'goods_pics.0': { $exists: false } },
              { 'goods_content_pics.0': { $exists: false } },
              { 'user.0': { $exists: false } },
            ],
          },
        },
        // 仅选择 _id，以便稍后删除
        {
          $project: {
            _id: 1,
            path: 1,
            sizes: 1,
          },
        },
      ])
      .exec()

    // 提取要删除的数据的 _id
    const idsToDelete = []
    const filesToDelete = []
    dataToDelete.forEach((item) => {
      idsToDelete.push(item._id)
      filesToDelete.push(item.path)
      if (item.sizes.length) {
        item.sizes.forEach((s) => {
          filesToDelete.push(this.tools.suffixPath(item.path, '_' + s))
        })
      }
    })
    //删除本地图片
    this.tools.removeLocalFile(filesToDelete)
    // 删除远程图片
    this.tools.removeRemoteFile(filesToDelete)

    // 使用 deleteMany 方法删除数据
    const deleteResult = await this.model.deleteMany({ _id: { $in: idsToDelete } })
    return deleteResult
  }

  //修改资源
}
