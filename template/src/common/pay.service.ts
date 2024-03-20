import WechatPay from '@/common/lib/wechat-node-pay'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PayService {
  wxPay: WechatPay
  constructor() {
    console.log({
      appid: process.env.WECHAT_APP_ID, //服务器ID
      mchid: process.env.WECHAT_MCH_ID, //商务ID
      secretKey: process.env.SECRET_KEY, //V3密钥
      // publicKey: fs.readFileSync('apiclient_cert.pem'), //商户的公钥
      //  privateKey: fs.readFileSync('apiclient_key.pem'),
    })
    /* this.wxPay = new WechatPay({
      appid: process.env.WECHAT_APP_ID, //服务器ID
      mchid: process.env.WECHAT_MCH_ID, //商务ID
      secretKey: process.env.SECRET_KEY, //V3密钥
      publicKey: '', //商户的公钥
      privateKey: '', //商户的私钥
    }) */
  }

  async pay(params: { title: string; orderId: string; price: number }) {
    console.log(process.env.WECHAT_NOTIFY_URL)
    const { title, orderId, price } = params
    const result = await this.wxPay.transactions_native({
      description: title, //交易的描述
      out_trade_no: orderId, //商户的订单号
      notify_url: process.env.WECHAT_NOTIFY_URL,
      amount: {
        //订单金额
        total: price, //总金额
        currency: 'CNY',
      },
      // scene_info: {
      //场景信息
      //payer_client_ip: req.ip, //用户终端IP
      // },
    })

    return result
  }
  /*
  async function invokeWechatPay(order, product, req) {
    const result = await wechatPay.transactions_native({
        description: `购买${product.name}`,//交易的描述
        out_trade_no: order.id,//商户的订单号
        notify_url: WECHAT_NOTIFY_URL,
        amount: {//订单金额
            total: product.price,//总金额
            currency: 'CNY'
        },
        scene_info: {//场景信息
            payer_client_ip: req.ip//用户终端IP
        }
    });
    logger.info(`transactions_native.result:${JSON.stringify(result)}`);
    const { code_url } = result;
    //更新订单信息,把支付二维码地址保存到订单里
    await Order.findByIdAndUpdate(order.id, { code_url });
    return code_url;
}*/
}
