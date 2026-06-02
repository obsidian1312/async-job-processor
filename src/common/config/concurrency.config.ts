import { registerAs } from "@nestjs/config";

export const REDIS = Symbol('REDIS');

export default registerAs('concurrency', () => ({
    limit: parseInt(process.env.CONCURRENCY_LIMIT || '1', 10),
    redisHost: process.env.REDIS_HOST!,
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
