import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AccessSchema } from '@/schema/access.schema'
import { AdminSchema } from '@/schema/adminschema'

import { ResourceSchema } from '@/schema/resource.schema'
import { RoleSchema } from '@/schema/role.schema'
import { RoleAccessSchema } from '@/schema/roleAccess.schema'
import { UpdateSchema } from '@/schema/update.schema'

import { AccessService } from '@/service/admin/access.service'
import { AdminService } from '@/service/admin/admin.service'

import { ResourceService } from '@/service/admin/resource.service'
import { RoleService } from '@/service/admin/role.service'
import { UpdateService } from '@/service/admin/update.service'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Admin',
        schema: AdminSchema,
        collection: 'admin',
      },
      {
        name: 'Role',
        schema: RoleSchema,
        collection: 'role',
      },
      {
        name: 'Access',
        schema: AccessSchema,
        collection: 'access',
      },
      {
        name: 'RoleAccess',
        schema: RoleAccessSchema,
        collection: 'roleAccess',
      },

      {
        name: 'Resource',
        schema: ResourceSchema,
        collection: 'resource',
      },

      {
        name: 'Update',
        schema: UpdateSchema,
        collection: 'update',
      },
    ]),
  ],
  providers: [AdminService, RoleService, AccessService, ResourceService, UpdateService],
  exports: [AdminService, RoleService, AccessService, ResourceService, UpdateService],
})
export class PublicModule {}
