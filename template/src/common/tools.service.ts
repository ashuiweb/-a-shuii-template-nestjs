import dict, { getDictLabel } from '@/common/dictionary'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as dayJS from 'dayjs'
import * as fsExtra from 'fs-extra'
import * as md5 from 'md5'
import { resolve } from 'path'
import * as svgCaptcha from 'svg-captcha'
import { CacheService } from './cache.service'
import { ConfigService } from './config.service'
import { EmailService } from './email.service'
import { SuccessException } from './exception/successException'
import { SessionType } from './types/session'
import { deleteAzure } from './upload/uploadAzure'
import { randomNum, remainTimeData } from './utils'
@Injectable()
export class ToolsService {
  constructor(
    private readonly config: ConfigService,
    private readonly catchServ: CacheService,
    private readonly emailServ: EmailService,
  ) {}
  captcha(length = 4) {
    return svgCaptcha.create({
      size: length,
      fontSize: 50,
      width: 100,
      height: 40,
      background: `rgb(237, 239, 252)`,
    })
  }
  async checkVerifyCode(data: { code: string; value: string; type: string }, session: SessionType) {
    if (!session.userData) return false
    //获取缓存值
    const res = await this.getCache(data.code)
    console.log(res)
    if (!res) return false
    const { uid, type, value, length } = res as unknown as { uid: string; value: string; type: string; length: number }
    if (session.userData.uid !== uid || type !== data.type || data.code.length !== length || value !== data.value)
      return false
    //删除
    this.delCache(data.code)
    return true
  }
  //value:是对应type的值 tel就是手机号 email就是邮箱，如果没有传value那么就从库里面取
  async sendVerifyCode(
    data: { length: number; ttl: number; use: 'tel' | 'email'; value?: string; type: string },
    session: SessionType,
  ) {
    //1. 生成随机数
    let code = randomNum(data.length)
    //如果已经存在则重新生成
    while (await this.getCache(code)) {
      code = randomNum(data.length)
    }
    //2. 获取随机数对应的对象
    const time = Math.round(data.ttl / 1000 / 60)
    let msg = {
      tel: {
        text: '手机号',
        field: 'phone',
        method: () => {
          console.log('开发中...')
        },
      },
      email: {
        text: '邮箱',
        field: 'email',
        method: () =>
          this.sendEmail({
            to: [{ name: session.userData.nick_name, email: data.value || session.userData.email }],
            subject: '验证码',
            text: `您的验证码为：${code}，${time}分钟内有效！`,
          }),
      },
    }
    const object = msg[data.use]
    const value = data.value || (session.userData ? session.userData[object.field] : null)
    if (!value) return { result: false, message: `${object.text}不存在` }

    // 缓存对象
    this.catchServ.cache.set(code, { ...data, value, uid: session.userData.uid }, data.ttl)
    // 发送code
    const res = await object.method()
    msg = null
    return { result: true, message: res }
  }
  md5(data: string, time = 1) {
    while (time) {
      data = md5(data)
      time--
    }
    return data
  }
  success(message = '操作成功', redirect?: string) {
    const data = { message, redirect: redirect || '' }

    throw new SuccessException({ message: data })

    // res.render('admin/public/error),{message:'',redicrecturl}
  }
  error(data: Record<string, string>) {
    const arr: { field: string; message: string }[] = []
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const item = {
          field: key,
          message: data[key],
        }
        arr.push(item)
      }
    }
    throw new BadRequestException(arr)
  }

  getConfig(key) {
    return this.config.res[key]
  }

  dayjs(time: number, format = 'YYYY-MM-DD HH:mm:ss') {
    return dayJS(time).format(format)
  }

  path(filepath: string) {
    return this.config.res.remote + filepath
  }

  //size:250x250||250_250
  linkUrl(obj: any, size = '') {
    const defaultLink = '/template/static/picture/g.jpg'

    if (!obj) return defaultLink
    let pathstr = ''
    if (Array.isArray(obj)) {
      pathstr = obj[0].path
    } else if (obj.path) {
      pathstr = obj.path
    }

    if (!pathstr) {
      return defaultLink
    }
    if (size) {
      size = size.replace('x', '_')
      // pathstr += '_' + size
      pathstr = this.suffixPath(pathstr, '_' + size)
    }
    return this.path(pathstr)
  }

  //给一个地址添加后缀  abc.jpg  abc_x.jpg
  suffixPath(path: string, append: string) {
    const index = path.lastIndexOf('.')
    const ext = path.slice(index)
    return path.slice(0, index) + append + ext
  }

  dict(key: keyof typeof dict, value: any) {
    const data = dict[key]
    if (value !== void 0) {
      return getDictLabel(data as any, value)
    }
    return data
  }

  //批量删除本地文件
  async removeLocalFile(filePaths: string[], rootPath = 'public/uploads/') {
    const root = resolve(__dirname, '../../', rootPath)

    try {
      // 使用 Promise.all 并行删除文件
      await Promise.allSettled(filePaths.map((filePath) => fsExtra.remove(resolve(root, filePath))))
      console.log('所有文件已成功删除')
    } catch (error) {
      console.error('删除文件时出错:', error)
    }
  }

  //批量删除远程文件
  async removeRemoteFile(filePaths: string[]) {
    try {
      await Promise.allSettled(filePaths.map((filePath) => deleteAzure(filePath)))
      console.log('所有远程文件已成功删除')
    } catch (error) {
      console.error('删除远程文件时出错:', error)
    }
  }

  //计算会员过期时间
  levelRemainTime(levelTime: number, days: number) {
    console.log(levelTime, days)
    if (days !== -1) {
      // 将天数转换为毫秒
      const daysInMilliseconds = days * 24 * 60 * 60 * 1000
      return remainTimeData(levelTime, daysInMilliseconds)
    }

    return {
      text: '永久',
      date: '永久',
    }
  }

  //缓存
  getCache(key: string) {
    return this.catchServ.cache.get(key)
  }

  setCache(key: string, value: any, ttl?: number) {
    return this.catchServ.cache.set(key, value, ttl)
  }

  delCache(key: string) {
    return this.catchServ.cache.del(key)
  }

  //发送邮件
  sendEmail(mailOptions: { to: { name: string; email: string }[]; subject: string; text?: string; html?: string }) {
    return this.emailServ.sendMail(mailOptions)
  }
}
