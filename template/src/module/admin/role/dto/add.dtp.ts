import { IsNotEmpty, IsOptional, Length, MaxLength } from 'class-validator'
export class AddRoleDto {
  @IsNotEmpty({ message: '角色名称不能为空' })
  @Length(2, 10, { message: '角色名称长度在2-10之间' })
  title: string

  @IsOptional()
  @MaxLength(50)
  description: string
}
