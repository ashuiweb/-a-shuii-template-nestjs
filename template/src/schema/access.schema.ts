import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaType } from 'mongoose'

@Schema()
export class Access extends Document {
  @Prop({ required: true })
  name: string //操作名

  @Prop({ default: 1 })
  type: number //操作名:1:模块 2：菜单：3：操作

  @Prop()
  url: string //操作路径

  @Prop({ type: SchemaType.Types.Mixed, ref: 'Access' })
  module_id: string | 0

  @Prop({ default: 0 })
  sort: number

  @Prop()
  description: string

  @Prop({ default: 0 })
  status: number

  @Prop({ default: () => Date.now() })
  create_time: number

  @Prop({ default: () => Date.now() })
  update_time: number
}

export const AccessSchema = SchemaFactory.createForClass(Access)
