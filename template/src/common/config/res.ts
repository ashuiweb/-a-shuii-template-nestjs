import { registerAs } from '@nestjs/config'
//需要传递给res.locals的配置
export default registerAs('res', () => ({
  //后台目录名
  admin: 'admin123',
  //admin静态资源目录
  admin_src: '/admin/',
  admin_img: '/admin/images/',
  admin_js: '/admin/js/',
  admin_css: '/admin/css/',
  remote: 'https://devopsblob01.blob.core.chinacloudapi.cn/gac/voice/blog/',
}))
