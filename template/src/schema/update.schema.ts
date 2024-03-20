import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

//id自增表
@Schema()
export class Update extends Document {
  @Prop({ required: true })
  name: string // 集合名称

  @Prop({ default: 0 })
  id: number

  @Prop({ default: '' })
  description: string

  @Prop({ default: () => Date.now() })
  update_time: number
}

export const UpdateSchema = SchemaFactory.createForClass(Update)
