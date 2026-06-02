import Redis from 'ioredis';
import { Module } from '@nestjs/common';
import { REDIS } from '../config/concurrency.config';

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule { }