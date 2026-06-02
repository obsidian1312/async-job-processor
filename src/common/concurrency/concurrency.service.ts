import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { REDIS } from '../config/concurrency.config';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';


@Injectable()
export class ConcurrencyService {
    private limit: number;

    constructor(
        @Inject(REDIS)
        private readonly redis: Redis,
        private readonly config: ConfigService,
        private readonly logger: PinoLogger
    ) {
        this.limit = this.config.getOrThrow<number>('concurrency.limit')
        this.logger.setContext(ConcurrencyService.name)
    }

    public async acquire(userId: string): Promise<void> {
        const key = `active:${userId}`;

        const current = await this.redis.incr(key);

        if (current > this.limit) {
            await this.redis.decr(key);
            this.logger.warn('Concurrency limit reached');
            throw new TooManyRequestsException('Too many active jobs');
        }
    }

    public async release(userId: string): Promise<void> {
        const key = `active:${userId}`;

        const val = await this.redis.get(key);

        if (!val) return;

        const num = Number(val);

        if (num <= 1) {
            await this.redis.del(key);
            return;
        }

        await this.redis.decr(key);
    }
}
