import * as dayJS from 'dayjs'
export const remainTimeData = (levelTime: number, daysInMilliseconds: number) => {
  // 计算新的过期时间
  const expirationTime = levelTime + daysInMilliseconds
  const time = expirationTime - Date.now()
  const date = dayJS(expirationTime).format('YYYY-MM-DD HH:mm:ss')
  //如果大于1天
  let unit = 24 * 3600 * 1000
  let unitText = '天'
  let result
  if (time > unit) {
    result = Math.ceil(time / unit)
    return {
      text: result + unitText,
      date,
    }
  }
  unit = 3600 * 1000
  unitText = '小时'
  if (time > unit) {
    result = Math.ceil(time / unit)
    return {
      text: result + unitText,
      date,
    }
  }
  return {
    text: Math.ceil(time / 1000) + '秒',
    date,
  }
}

const chars = 'abcdefghijklmnoqprstuvwxyz!@#_0123456789+$%'
export const randomNumber = (max: number) => Math.floor(Math.random() * max)
const randomChar = (chars: string) => (length: number) => {
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars[randomNumber(chars.length)]
  }
  return str
}

export const randomText = randomChar(chars)

export const randomNum = randomChar('0123456789')
