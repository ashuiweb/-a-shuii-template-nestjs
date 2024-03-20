import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Admin, AdminSchema } from 'src/schema/adminschema'
import { BaseService } from './base.service'

@Injectable()
export class AdminService extends BaseService<Admin> {
  constructor(@InjectModel('Admin') public model: Model<typeof AdminSchema>) {
    super()
  }
}
