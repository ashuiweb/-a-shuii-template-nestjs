import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaType } from 'mongoose'

@Schema()
export class Admin extends Document {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ type: SchemaType.Types.ObjectId })
  role_id: string

  @Prop()
  mobile: string

  @Prop()
  email: string

  @Prop({ default: 1 })
  status: number

  @Prop({ default: Date.now() })
  create_time: number

  @Prop({ default: 0 })
  is_super: number

  @Prop({ default: Date.now() })
  update_time: number
}

export const AdminSchema = SchemaFactory.createForClass(Admin)
