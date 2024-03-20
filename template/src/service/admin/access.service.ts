import { Access, AccessSchema } from '@/schema/access.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseService } from './base.service'
@Injectable()
export class AccessService extends BaseService<Access> {
  constructor(@InjectModel('Access') public model: Model<typeof AccessSchema>) {
    super()
  }

  async accessList() {
    const list = await this.model.aggregate([
      {
        $sort: {
          sort: 1,
        },
      },
      /*  {
        $lookup: {
          from: 'access',
          localField: '_id',
          foreignField: 'module_id',
          as: 'modules',
        },
      }, */
      {
        $lookup: {
          from: 'access',
          let: { local_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$module_id', '$$local_id'],
                },
              },
            },
            {
              $sort: {
                sort: 1,
              },
            },
          ],
          as: 'modules',
        },
      },
      {
        $match: {
          module_id: 0,
        },
      },
    ])

    return list
  }
}
