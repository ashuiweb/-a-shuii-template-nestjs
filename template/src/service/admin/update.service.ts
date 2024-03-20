import { Update, UpdateSchema } from '@/schema/update.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BaseService } from './base.service'
@Injectable()
export class UpdateService extends BaseService<Update> {
  constructor(@InjectModel('Update') public model: Model<typeof UpdateSchema>) {
    super()
  }
}
