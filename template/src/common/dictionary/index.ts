import * as dict from './dict'
import { enumsToDict } from './tool'

const dicts = enumsToDict(dict)

const dictData = { ...dict, ...dicts }

type DictType = keyof typeof dicts
type DictItemType = { label: string; value: any }

function getDictByType(dict: DictItemType[] | DictType) {
  if (typeof dict === 'string') {
    return dicts[dict]
  }
  return dict
}

export function getDictLabel(dict: DictItemType[], value: any): string
export function getDictLabel(dict: DictType, value: any): string
export function getDictLabel(dict: DictItemType[] | DictType, value: any) {
  dict = getDictByType(dict)
  const item = dict.find((item) => item.value === value)
  return item ? item.label : ''
}

export const getDictValue: {
  (dict: DictItemType[], value: any): string
  (dict: DictType, value: any): string
} = (dict: DictItemType[] | DictType, label: string) => {
  dict = getDictByType(dict)
  const item = dict.find((item) => item.label === label)
  return item ? item.label : ''
}

export default dictData
