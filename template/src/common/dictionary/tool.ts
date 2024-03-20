type DictItemType = { label: string; value: any }

export const enmuToDict = (data: Record<string, any>): DictItemType[] => {
  const res: DictItemType[] = []
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const item = data[key]
      if (isNaN(+key)) {
        const it: DictItemType = { label: key, value: item }
        res.push(it)
      }
    }
  }
  return res
}

export function enumsToDict<T>(data: T): Record<`${Extract<keyof T, string>}Dict`, DictItemType[]> {
  const result: Record<`${Extract<keyof T, string>}Dict`, DictItemType[]> = {} as any
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const enumData = data[key]
      result[key + 'Dict'] = enmuToDict(enumData)
    }
  }
  return result
}
