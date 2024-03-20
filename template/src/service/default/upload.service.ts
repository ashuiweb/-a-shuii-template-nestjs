import resConfig from '@/common/config/res'
import { Injectable } from '@nestjs/common'
import { ResourceService } from '../admin/resource.service'
const resConfigData = resConfig()
@Injectable()
export class UploadService {
  constructor(public readonly resourceService: ResourceService) {}
  async upload(file: Express.Multer.File, uid: string, src_id?: string, sizes: string[] = []) {
    console.log(src_id)

    const data = await this.resourceService.doSave(
      {
        type: file.mimetype,
        size: file.size,
        path: file.path,
        from: 'default',
        uid,
        sizes,
      },
      { id: src_id },
    )

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const result = data.toJSON ? data.toJSON() : data
    result.link = resConfigData.remote + result.path
    console.log(result)
    return result
  }
}
