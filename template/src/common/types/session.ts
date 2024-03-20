export interface SessionType {
  code: string //后台登录验证码
  message: { message: Record<string, any> | Record<string, any>[]; url: string } //提示消息
  userInfo: any
  authAccessIds: string[]
  referer: string
  userData: any //前端用户信息
}
