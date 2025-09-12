import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore as any,
        url: process.env.REDIS_URL, // from .env
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}