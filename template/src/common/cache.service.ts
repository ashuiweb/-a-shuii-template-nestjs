import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) public readonly cache: Cache) {}
}
