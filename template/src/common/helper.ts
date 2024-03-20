import { BadRequestException } from '@nestjs/common'
import { Request } from 'express'
export const validateFail = (field: string, message: string) => {
  throw new BadRequestException({
    error: 'Bad Request',
    message: [{ field, message }],
    statusCode: 400,
  })
}
export const sendSuccess = (message = '操作成功') => {
  throw new BadRequestException({
    error: null,
    message: [{ message }],
    statusCode: 200,
  })
}
export const sendFail = (message = '操作失败') => {
  throw new BadRequestException({
    error: null,
    message,
    statusCode: 400,
  })
}
export const requestKey = (request: Request) => request.method + request.originalUrl
export const requestAuthKey = (request: Request) =>
  request.method + request.originalUrl + request.headers['authorization']
export const paginate = (data: { page: number; size: number; total: number; data: any[] }) => ({
  page: data.page,
  size: data.size,
  total_size: data.total,
  total_page: Math.ceil(data.total / data.size),
  data: data.data,
})

export const paginatePrisma = async (
  modal: { findMany: (data: any) => Promise<any>; count: (data?: any) => Promise<any> },
  page: number,
  size: number,
  orderBy: string = 'create_time',
  order: any = 'desc',
  where?: any,
) => {
  const data = await modal.findMany({
    take: size,
    skip: (page - 1) * size,
    orderBy: {
      [orderBy]: order,
    },
    where,
  })
  const total = await modal.count({ where })
  return paginate({ data, page, size, total })
}
