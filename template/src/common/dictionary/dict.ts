export enum AccessType {
  模块 = 1,
  菜单,
  操作,
}

export enum BannerType {
  网站 = 1,
  APP,
  小程序,
}

export enum StatusType {
  禁用,
  启用,
}

export enum AttrType {
  文本框 = 1,
  文本域,
  下拉框,
  单选框,
  多选框,
  文件,
}

export enum ModelType {
  通用 = '',
  商品 = 'goods',
  导航 = 'nav',
  文章 = 'article',
}

export enum LinkType {
  当前页面,
  新页面,
}

export enum PayType {
  未支付,
  余额支付,
  支付宝,
  微信,
}

export enum OrderType {
  虚拟商品,
  实物商品,
}

export enum OrderStatusType {
  未支付,
  已支付,
  已发货,
  已收货,
  已完成,
}
