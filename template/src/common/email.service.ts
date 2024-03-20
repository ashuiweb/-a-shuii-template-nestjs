import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
@Injectable()
export class EmailService {
  public sender: nodemailer.Transporter
  constructor() {
    this.sender = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: 'ashuiweb@qq.com',
        pass: 'gzbauuebkcyibehf',
      },
    })

    this.sender.verify(function (error) {
      if (error) {
        console.log(error, '邮件服务启动失败')
      } else {
        console.log('邮件服务启动成功')
      }
    })
  }

  sendMail(mailOptions: { to: { name: string; email: string }[]; subject: string; text?: string; html?: string }) {
    return new Promise((resove, reject) => {
      // to: '"ashuiweb" <ashuiweb@163.com>,"ashui" <bangbangyang@yeah.net>',
      let to = ''
      mailOptions.to.forEach((item) => {
        to += `"${item.name}" <${item.email}>,`
      })
      this.sender.sendMail(
        {
          ...mailOptions,
          to,
          from: '"阿水小栈" <ashuiweb@qq.com>',
        },
        (error, info) => {
          if (error) {
            console.log(error)
            reject(error)
          } else {
            resove(info)
          }
        },
      )
    })
  }
}
