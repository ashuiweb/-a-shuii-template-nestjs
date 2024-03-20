type Options = { once: boolean }
const globalData: Record<string, { __value: any; __options: Options }> = {}
//全局状态管理
export const setGlobalData = (k: string, v: any, o: Options) => {
  const value = { __value: v, __options: o }
  globalData[k] = value
}
export const getGlobalData = (k: string) => {
  const data = globalData[k]
  if (!data) return null
  const { __value, __options } = data
  if (__options.once) delete globalData[k]
  return __value
}
