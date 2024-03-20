import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as SchemaType } from 'mongoose'

@Schema()
export class RoleAccess extends Document {
  @Prop({ type: SchemaType.Types.ObjectId })
  role_id: string

  @Prop({ type: SchemaType.Types.ObjectId })
  access_id: string
}

export const RoleAccessSchema = SchemaFactory.createForClass(RoleAccess)
