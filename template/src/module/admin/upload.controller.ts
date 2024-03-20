import resConfig from '@/common/config/res'
import { AdminController } from '@/common/decorator/adminController'
import { SessionType } from '@/common/types/session'
import { Upload } from '@/common/upload/upload.decorator'
import { ResourceService } from '@/service/admin/resource.service'
import { Body, Post, Query, Session, UploadedFile } from '@nestjs/common'
const resConfigData = resConfig()
@AdminController('upload')
export class UploadController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post('image')
  @Upload({ limit: 2, type: 'image' })
  async image(
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
    @Query() query,
    @Session() session: SessionType,
  ) {
    console.log(query.sizes)
    const _sizes = body.sizes || (!!query.sizes ? JSON.stringify(query.sizes.split(',')) : null)

    const sizes = _sizes ? JSON.parse(_sizes).map((it) => it.replace('x', '_')) : []
    console.log(sizes)
    const data = await this.resourceService.doSave(
      {
        type: file.mimetype,
        size: file.size,
        path: file.path,
        from: 'admin',
        uid: session.userInfo?._id.toString(),
        sizes,
      },
      body,
    )
    console.log(data)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const result = data.toJSON ? data.toJSON() : data
    result.link = resConfigData.remote + result.path
    return result
  }
}
