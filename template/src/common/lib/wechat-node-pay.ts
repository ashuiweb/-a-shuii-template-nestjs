import { Certificate } from '@fidm/x509'
import axios from 'axios'
import * as crypto from 'crypto'
const wechatPayAPI = axios.create({
  //预设了微信支付的域名
  baseURL: 'https://api.mch.weixin.qq.com',
  headers: {
    //默认的请求头
    'Content-Type': 'application/json', //指定请求体的类型
    Accept: 'application/json', //期待服务器返回的类型也是JSON
  },
})
function getSerial_no(publicKey) {
  //从PEM公钥中提取证书序列号
  // openssl x509 -in 1900009191_20180326_cert.pem -noout -serial
  return Certificate.fromPEM(publicKey).serialNumber.toUpperCase()
}
//缓存所有的证书,key是微信服务器的证书编号，值是微信服务器的证书的公钥
const CERTIFICATES = {}
class WechatPay {
  appid
  mchid
  publicKey
  privateKey
  secretKey
  serial_no
  constructor({ appid, mchid, publicKey, privateKey, secretKey }) {
    this.appid = appid
    this.mchid = mchid
    this.publicKey = publicKey
    this.serial_no = getSerial_no(publicKey)
    this.privateKey = privateKey
    this.secretKey = secretKey
  }
  //向微信服务器发送请求
  async request(method, url, body = {}) {
    //1. 准备商户号、商户公钥和商户私钥
    //2.构造签名串
    //第一步，获取HTTP请求的方法（GET，POST，PUT）等 method
    //第二步，获取请求的绝对URL，并去除域名部分得到参与签名的URL url
    //第三步，获取发起请求时的系统当前时间戳
    const timestamp = Math.floor(Date.now() / 1000).toString()
    //第四步，生成一个请求随机串
    const nonce_str = Math.random().toString(36).substring(2, 17)
    //第五步，获取请求中的请求报文主体（request body）。 body
    const signature = this.sign(method, url, nonce_str, timestamp, body)
    //logger.info(`signature`, signature)
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${nonce_str}",timestamp="${timestamp}",serial_no="${this.serial_no}",signature="${signature}"`
    //logger.info('Authorization', Authorization)
    const headers = {
      Authorization,
    }
    try {
      console.log(body)
      const response = await wechatPayAPI.request({
        method, //请求的方法
        url, //请求的路径
        data: body, //指定请求体
        headers,
      })
      //返回响应体
      return response.data
    } catch (error) {
      console.log(error)
    }
  }
  sign(method, url, nonce_str, timestamp, body) {
    //第六步，按照前述规则，构造的请求签名串为：
    let requestSignStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n`
    requestSignStr += method !== 'GET' && body ? `${JSON.stringify(body)}\n` : '\n'
    //logger.info('requestSignStr', requestSignStr)
    //3. 计算签名值
    //使用商户私钥对待签名串进行SHA256 with RSA签名，并对签名结果进行Base64编码得到签名值
    const rsaSha = crypto.createSign('RSA-SHA256')
    //输入待签名串
    rsaSha.update(requestSignStr)
    //按base64格式输出签名的结果
    //rsaSha.sign(privatekey, "base64") 相当于做了生成摘要和加密两个动作是吗？
    return rsaSha.sign(this.privateKey, 'base64')
  }
  async transactions_native(params) {
    const url = `/v3/pay/transactions/native`
    //准备请求体
    const requestParams = {
      appid: this.appid, //应用ID
      mchid: this.mchid, //商户ID
      ...params,
    }
    return await this.request('POST', url, requestParams)
  }
  async fetchWechatPayPublicKey(serial) {
    //先尝试从缓存中读取微信的公钥
    const wechatPayPublicKey = CERTIFICATES[serial]
    //如果有则直接返回此公钥
    if (wechatPayPublicKey) return wechatPayPublicKey
    //获取商户当前可用的微信支付平台证书列表
    const url = '/v3/certificates'
    const result = await this.request('GET', url)
    //logger.info('certificates.result', result)
    //获取证书列表
    const certificates = result.data
    certificates.forEach(({ serial_no, encrypt_certificate }) => {
      //解密证书
      const certificate = this.decrypt(encrypt_certificate) as any
      //logger.info('certificate', certificate)
      //取出解密后的证收中的公钥，转成PEM格式并缓存在CERTIFICATES
      CERTIFICATES[serial_no] = Certificate.fromPEM(certificate).publicKey.toPEM()
    })
    //返回此序列号对应的微信平台公钥
    return CERTIFICATES[serial]
  }
  decrypt(encrypted) {
    //algorithm=AEAD_AES_256_GCM
    //ciphertext=加密后的证书内容,nonce加密证书的随机串】 对应到加密算法中的IV。
    //加密算法中的IV就是加盐，即使原文一样，密钥一样，因为盐值的不同，密文也不一样
    const { ciphertext, associated_data, nonce } = encrypted
    const encryptedBuffer = Buffer.from(ciphertext, 'base64')
    //encryptedBuffer分成二部分，最后的16个字节是认证标签
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16)
    //前面的才是加密后的内容
    //AEAD_AES_256_GCM 提供了认证加密的功能，在这个模块式，除了加密的数据本身外，还生成一个认证标签的额外数据
    //用于保证数据的完整性的真实性
    //AAD附加认证数据 AAD是在加密过程中使用的数据，但不会被加密
    const encryptedData = encryptedBuffer.subarray(0, encryptedBuffer.length - 16)
    //创建一个解密器
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.secretKey, nonce)
    decipher.setAuthTag(authTag) //设置认证标签
    decipher.setAAD(Buffer.from(associated_data)) //设置附加认证数据
    //开始解密，得到解密结果
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
    const decryptedString = decrypted.toString('utf8')
    return decryptedString
  }
  async verifySign(params) {
    //构造验签名串
    const { body, signature, serial, nonce, timestamp } = params
    const wechatPayPublicKey = await this.fetchWechatPayPublicKey(serial)
    //logger.info('wechatPayPublicKey', wechatPayPublicKey)
    const verifySignStr = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`
    //logger.info('verifySignStr', verifySignStr)
    //获取应答签名,使用 base64 解码 Wechatpay-Signature 字段值，得到应答签名。
    //最后，验证签名，得到验签结果。
    const verify = crypto.createVerify('RSA-SHA256') //创建验证对象
    verify.update(verifySignStr) //更新验证数据
    //微信平台的公钥,签名，编码
    return verify.verify(wechatPayPublicKey, signature, 'base64')
  }
  async query(orderNo) {
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}?mchid=${this.mchid}`
    return await this.request('GET', url)
  }
  async close(orderNo) {
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}/close`
    return await this.request('POST', url, { mchid: this.mchid })
  }
}
export default WechatPay
/**
微信支付API v3 要求商户对请求进行签名，微信支付会在收到请求后进行签名的验证。
如果签名验证不通过，微信支付API v3将会拒绝处理请求，并返回401 Unauthorized。

微信支付商户API v3要求请求通过HTTP Authorization头来传递签名。
Authorization由认证类型和签名信息两个部分组成。
Authorization: 认证类型 签名信息
Authorization: WECHATPAY2-SHA256-RSA2048 
Authorization: WECHATPAY2-SHA256-RSA2048 
mchid="1900009191",
nonce_str="593BEC0C930BF1AFEB40B4A08C8FB242",
signature="sign",
timestamp="1554208460",
serial_no="1DDE55AD98ED71D6EDD4A4A16996DE7B47773A8C"
 */
