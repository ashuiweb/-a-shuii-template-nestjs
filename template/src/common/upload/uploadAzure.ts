import { BlobServiceClient } from '@azure/storage-blob'
import * as fs from 'fs'
import { resolve } from 'path'
import { Readable } from 'stream'
// 用您的 Azure Storage 账户名称和密钥替换此值
const AZURE_STORAGE_CONNECTION_STRING =
  'AccountName=devopsblob01;AccountKey=LoUcWgJw+B1EbIBKmX0J0DO8XcgvIil8gQfRg0cLVl9wu9FFJlvS4gBAorajtMHrA7CzO67X4cr9L24oKY/0oA==;EndpointSuffix=core.chinacloudapi.cn;DefaultEndpointsProtocol=https;'
// 创建 BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
// 获取容器客户端
const containerClient = blobServiceClient.getContainerClient('gac')

/* // 创建容器（如果不存在）这里我知道他肯定存在
  await containerClient.createIfNotExists() */

export async function uploadAzure(localFilePath: string | { data: Buffer; fileName: string }, dirName = 'voice/blog/') {
  console.log(localFilePath)
  if (typeof localFilePath === 'string') {
    // 获取 Blob 客户端
    const blobName = dirName + localFilePath.replace(/\\/g, '/').replace(/public\/uploads\//, '')
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    // 读取本地文件并上传
    localFilePath = resolve(__dirname, '../../../', localFilePath)
    const stream = fs.createReadStream(localFilePath)
    const fileSize = fs.statSync(localFilePath).size
    try {
      await blockBlobClient.uploadStream(stream, fileSize, 20, {})
    } catch {}
  } else {
    const { data, fileName } = localFilePath
    const blockBlobClient = containerClient.getBlockBlobClient(dirName + fileName)
    const stream = new Readable({
      read() {
        this.push(data)
        this.push(null) // 表示流的结束
      },
    })
    const fileSize = data.length
    try {
      await blockBlobClient.uploadStream(stream, fileSize, 20, {})
    } catch {}
  }
}

export async function deleteAzure(blobFilePath, dirName = 'voice/blog/') {
  // 获取 Blob 客户端
  const blobName = dirName + blobFilePath

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  // 删除文件
  try {
    await blockBlobClient.delete()
  } catch (error) {}
}
