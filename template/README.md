创建 admin、default、api三个模块
配置cookie、session、ejs、静态资源目录
>main.ts

```ts
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'

import { AppModule } from './app.module'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets('public', { prefix: '/public' })
  app.setBaseViewsDir('views')
  app.use(cookieParser())
  app.setViewEngine('ejs')
  app.use(
    session({
      secret: 'ashuiweb',
      resave: false,
      saveUninitialized: true,
      rolling: true,
      cookie: { maxAge: 60000 * 30, httpOnly: true },
    }),
  )
  await app.listen(3002)
}
bootstrap()

```
## 1. admin 模块
创建main、login控制器
> login

```ts
import { Controller, Get, Render } from '@nestjs/common'

@Controller('admin/login')
export class LoginController {
  @Get()
  @Render('admin/login')
  index() {
    return {}
  }
}

```

###  使用iframe 后台页面
使用ejs模板分离 `<%- include ('../public/header.ejs')%>`

### 使用 svg-captcha 验证码
`pnpm i svg-captcha`
```js
import * as svgCaptcha from 'svg-captcha'

 async captch() {
    return svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      background: `#cc9966`,
    })
  }
```
返回图片
```js
 getCode(@Request() req, @Response() res) {
    const svgCaptcha = this.tools.captcha()
    //设置session
    req.session.code = svgCaptcha.text

    res.type('image/svg+xml')

    res.send(svgCaptcha.data)
  }
```

### 中间件admin未登录跳转登录
```ts
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
const whiteList = ['/login','/err']
@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const path: string = req.originalUrl
    if (whiteList.some((it) => path.includes(it))) {
      return next()
    }
    //判断是否登录
    //获取session中的用户信息
    const userInfo = (req.session as any).userInfo
    if (userInfo && userInfo.name) {
      next()
    } else {
      res.redirect('/admin/login')
    }
  }
}

```
> admin.module
这里虽然只加在了adminModule上，但是和加在appModule上是一样的，只是做了一个代码上的分隔
```js
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes('admin')
  }
}
```

### 使用filer处理异常
新建了一个自定义的成功异常
```js
import { HttpStatus } from '@nestjs/common/enums'
import { HttpException } from '@nestjs/common/exceptions'

export class SuccessException extends HttpException {
  constructor(message: { message: { message: string; redicect?: string } }) {
    super(message, HttpStatus.OK)
  }
}

```
借助filter实现异常的处理
```js
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
import { Request, Response } from 'express'
import { SuccessException } from '../exception/successException'
import { SessionType } from '../types/session'
//接收异常类型
@Catch(BadRequestException, SuccessException)
export class ValidateExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException | SuccessException, host: ArgumentsHost) {
    const ctx = host.switchToHttp() //获取http上下文
    const resp = ctx.getResponse() as Response
    const req = ctx.getRequest() as Request
    const responseObj = exception.getResponse() as any
    const session = req.session as unknown as SessionType
    session.message = { message: responseObj.message, url: req.originalUrl }
    console.log(session.message)

    if (exception instanceof BadRequestException && process.env.OUTPUT_ERR === 'json')
      return resp.status(responseObj.statusCode).json(responseObj)
    if (exception instanceof SuccessException && process.env.OUTPUT_OK === 'json')
      return resp.status(responseObj.statusCode).json(responseObj)
    else {
      return exception instanceof BadRequestException
        ? resp.redirect('/admin/message/err')
        : resp.redirect('/admin/message/ok')
    }
  }
}

```

### 配置全局模板变量
```js
res.locals.key=value
```
基于这个 来创造我们的全局配置和方法 只适合针对当前请求的访问。
 
**用途**：
1. **数据传递**: 通过 `res.locals`，你可以在路由处理函数中设置数据，然后在视图模板中使用这些数据。这允许在请求处理的不同阶段传递数据，如将页面标题或用户信息传递给视图模板。

**优点**：
1. **简单**: `res.locals` 是一个简单而方便的方法来传递数据，特别是对于共享数据的情况。它不需要创建自定义中间件或拦截器。

2. **局部作用域**: 数据存储在 `res.locals` 中，不会泄漏到其他请求，因此具有局部作用域，这有助于避免数据混乱。

**不足**：
1. **不适用于异步操作**: 如果在请求处理中存在异步操作，`res.locals` 可能会导致数据不可预测的问题，因为它在整个请求周期中保持不变。

2. **滥用可能导致混乱**: 滥用 `res.locals` 可能导致代码混乱，因此需要谨慎使用，确保只用于适当的数据传递。

总之，`res.locals` 是一个方便的工具，用于在 Express.js 应用中传递数据，但需要谨慎使用以避免潜在的问题。

 
### 实现存res.locals机制
以下几种数据会存入res.locals
- 在config/res.ts中的数据
- 在session中的数据
- tools.service


# 微信支付(普通商户 )
1. 生成订单
   伪代码：
   ```js
   const {prderNo} = await createOrder({
    product:productId,
    totalFee:order.price,
    orderStatus:'UNPAIED'
   })
   ```
2. 调用微信支付统一下单接口API
   伪代码
   ```js
   const WechatPay = require('wechatpay-nodejs-sdk')
   const wechatPay = new WechatPay({
    appid,
    mchid,
    secretKey,
    publicKey:fs.readFileSync('./apiclient_cert.pem'),//公钥
    privateKey:fs.readFileSync('./apiclient_key.pem'),//私钥
   })
   async function invokeWechatPay(order,product,req){
    //pay.weixin.qq.com/docs/merchant/apis/native-payment
   const reuslt =  await wechatPay.transactions_native({
      description:`购买${product.name}`//交易描述
      out_trade_no:order.id,//商户的订单号
      notify_url:'',//微信回调地址
      amount:{
        total:product.price,//总金额
        currency:"CNY"
      },
      scene_info:{ //场景信息 选填
        payer_chient_ip:req.ip,//用户客户端IP 必填
      }

    })

    const {code_url} = result 
    //更新订单信息 把支付二维码地址保存到订单里
    await Order.update(order.id,{code_url})
    return code_url;
   }

   ```
3. 把生成的订单号和支付二维码url返回给客户端
   ```json
   {
    "orderNo":"123123123123",
    "code_url":"weixin//wxpay/bizpayurl?pr=DNDruw4zz"
   }
   ```
4. 生成二维码让用户扫码
   前端和后端都可以生成。

5. 用户的支付成功与否的异步回调
   
- 验证签名保证此通知是真的从微信服务器过来的，签名值在http头Wechatpay-Signature
  - 接收成功 返回200或204 告诉微信
  - 接收失败 返回5xx或4xx 同时需要返回应答报文告诉微信
  ```js
   const {headers,body} = req
   const signature = header['wechatpay-signature'] //签名值
   const serial = headers['wechatpay-serial']      //证书序列号
   const timeStamp = headers['wechatpay-timestamp']//时间戳
   const nonce = headers['wechatpay-nonce']        //随机值
   //构建
   const isVerified = await wechatPay.verifySign({
    body,
    signature,
    timeStamp,
    nonce,
    serial
   })
   if(isVerified && body && body.event_type === "TRANSACTION.SUCCESS"){
    //解密
    const resultStr = wechatPay.decrypt(body.resource)
    const reulst = JSON.parse(resultStr)
    //更新订单 根据订单号更新数据
    const {order_trade_no} = result
    //====
   }else{

   }
  ```


## 拓展 向微信服务器发送请求
```js
  const crypto = require('crypto')  //node自带的签名模块
  const {Certificate} = require('@fidm/x509');
  function getSerial_no(publicKey){
    //从PEM公钥中提取证书序列号
    // openssl x509 -in 1900009191_20180326_cert.pem -noout -serial
    return Certificate.fromPEM(publicKey).serialNumber.toUpperCase(); // 也可以直接从微信支付后台拿到 
}
//缓存所有的证书,key是微信服务器的证书编号，值是微信服务器的证书的公钥
const CERTIFICATES = {};
  //=====================================
class WechatPay{
  constructor({appid,mchid,publicKey,privateKey,secretKey}){
    this.appid = appid;
    this.mchid = mchid;
    this.publicKey = publicKey;
    this.serial_no = getSerial_no(publicKey);
    this.privateKey = privateKey;
    this.secretKey = secretKey;
  }
  sign(method,url,nonce_str,timestamp,body){
    let singStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n`
    singStr +=(method!=='GET' && body)?`${JSON.stringify(body)}\n`:'\n'

    //计算签名值
    // 使用商户私钥对签名串进行SHA256 with RSA签名并对签名结果Base64
    const rsaSha = crypto.createSign('RSA-SHA256')
    //输入签名串
    rsaSha.update(singStr)
    //使用私钥对其签名 base64  // sha256生成摘要再用rsa生成秘钥
    return  rsaSha.sign(this.privateKey,'base64')
  }
  async request(method,url,body={}){
    //1. 准备商户号，商户公钥和私钥
    //2. 构造签名串
    //2-1 获取时间戳
    const timestamp = Math.floor(Date.now()/1000).toString()
    //2-2 随机串
    const nonce_str = Math.random().toString(36).substring(2,13)
    //2-3 构造请求签名
   
    const signature = this.sign(method,url,nonce_str,timestamp,body)
    //2-4 权限信息
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${nonce_str}",timestamp="${timestamp}",serial_no="${this.serial_no}",signature="${signature}"`;

    const response = await axiosInstance.request({
      method,
      url,
      data:body,
       headers:{Authorization}
    })

    return response.data
  }

  async transactions_native(params){
    const url = `/v3/pay/transactions/native`;
    //准备请求体
    const requestParams = {
        appid:this.appid,//应用ID
        mchid:this.mchid,//商户ID
        ...params
    }
    return await this.request('POST',url,requestParams);
  }

  //验签
  async verifySign(params){
    const { body, signature, timeStamp, nonce, serial} = params
    const verifySignStr = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
    
    const verifyer = crypto.createVerify('RSA-SHA256')
    verifyer.update(verifySignStr) // 更新验证数据
    
    //微信平台公钥，签名，编码
    return verifyer.verify(wechatPayServerPublicKey,signature,'base64')
  }


    async  fetchWechatPayPublicKey(serial){
    //先尝试从缓存中读取微信的公钥
    const wechatPayPublicKey = CERTIFICATES[serial];
    //如果有则直接返回此公钥
    if(wechatPayPublicKey) return wechatPayPublicKey;
    //获取商户当前可用的微信支付平台证书列表
    const url = '/v3/certificates';
    const result = await this.request('GET',url);
    
    //获取证书列表
    const certificates = result.data;
    certificates.forEach(({serial_no,encrypt_certificate})=>{
      //解密证书
      const certificate = this.decrypt(encrypt_certificate);
      logger.info('certificate',certificate);
      //取出解密后的证收中的公钥，转成PEM格式并缓存在CERTIFICATES
      CERTIFICATES[serial_no]=Certificate.fromPEM(certificate).publicKey.toPEM();
    });
    //返回此序列号对应的微信平台公钥
    return CERTIFICATES[serial];
  }

  
  decrypt(encrypted){
    //algorithm=AEAD_AES_256_GCM
    //ciphertext=加密后的证书内容,nonce加密证书的随机串】 对应到加密算法中的IV。
    //加密算法中的IV就是加盐，即使原文一样，密钥一样，因为盐值的不同，密文也不一样
    const {ciphertext,associated_data,nonce} = encrypted;
    const encryptedBuffer = Buffer.from(ciphertext,'base64');
    //encryptedBuffer分成二部分，最后的16个字节是认证标签
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length-16);
    //前面的才是加密后的内容
    //AEAD_AES_256_GCM 提供了认证加密的功能，在这个模块式，除了加密的数据本身外，还生成一个认证标签的额外数据用于保证数据的完整性的真实性
    //AAD附加认证数据 AAD是在加密过程中使用的数据，但不会被加密
    const encryptedData = encryptedBuffer.subarray(0,encryptedBuffer.length-16);
    //创建一个解密器 secretKey:v3秘钥
    const decipher = crypto.createDecipheriv('aes-256-gcm',this.secretKey,nonce);
    decipher.setAuthTag(authTag);//设置认证标签
    decipher.setAAD(Buffer.from(associated_data));//设置附加认证数据
    //开始解密，得到解密结果 
    const decrypted = Buffer.concat([decipher.update(encryptedData),decipher.final()]);
    const decryptedString = decrypted.toString('utf8');
    return decryptedString
  }
  //查询订单
   async query(orderNo){
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}?mchid=${this.mchid}`;
    return await this.request('GET',url);
  } 
  //关闭订单
  async close(orderNo){
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}/close`;
    return await this.request('POST',url,{mchid:this.mchid});
  }
}
```
   