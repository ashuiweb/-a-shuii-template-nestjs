/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'
import mongoose from 'mongoose'

mongoose.connect(process.env.MONGODB_URL)
const connection = mongoose.connection

export function IsUnique(fields: string[] = [], flag = true, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsExistsRule',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [propertyName],
      options: { message: `数据${flag ? '已' : '不'}存在`, ...validationOptions },
      validator: {
        async validate(value: string, args: ValidationArguments) {
          console.log(object, args, propertyName, value, fields)
          const promise = new Promise((resolve) => {
            connection.once('open', async () => {
              // 创建匿名模型
              const Model = mongoose.model('role', {} as any)
              // 执行查询操作
              console.log('执行查询操作')
              const data = await Model.aggregate([
                {
                  $match: {
                    $or: [propertyName, ...fields].map((field) => ({ [field]: value })),
                  },
                },
              ])
              console.log(data)
              resolve(data)
              // 关闭数据库连接
              mongoose.connection.close()
            })
          })

          const data = await promise
          console.log(data)
          /*  //查询表
          const data = await model.aggregate([
            {
              $match: {
                $or: [propertyName, ...fields].map((field) => ({ [field]: value })),
              },
            },
          ])
          if (data) {
            setGlobalData(JSON.stringify({ ...args.object }), data, { once: true })
          }
          return flag ? !data : !!data */
          return true
        },
      },
    })
  }
}
