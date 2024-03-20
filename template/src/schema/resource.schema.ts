import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaType } from 'mongoose'

@Schema()
export class Resource extends Document {
  @Prop({ required: true })
  type: string //资源类型  image video audio

  @Prop({ default: 0 })
  size: number //大小

  @Prop({ type: [String] })
  sizes: string[] // 其他尺寸
  @Prop({ required: true })
  path: string //路径

  @Prop({ required: true })
  from: string //admin | api | default |

  @Prop({ type: SchemaType.Types.ObjectId })
  uid: string

  @Prop({ default: 1 })
  status: number

  @Prop({ default: () => Date.now() })
  create_time: number

  @Prop({ default: () => Date.now() })
  update_time: number
}

export const ResourceSchema = SchemaFactory.createForClass(Resource)
