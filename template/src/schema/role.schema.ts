import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Role extends Document {
  @Prop({ required: true })
  title: string

  @Prop()
  description: string

  @Prop({ default: 1 })
  status: number

  @Prop({ default: () => Date.now() })
  create_time: number

  @Prop({ default: () => Date.now() })
  update_time: number
}

export const RoleSchema = SchemaFactory.createForClass(Role)
