import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
    level: process.env.LOG_LEVEL || 'info',
    isProduction: process.env.NODE_ENV === 'production',
    target: 'pino-pretty',
    singleLine: true,
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname,req,res,context,responseTime',
    messageFormat: '[{context}] {msg}',
}));
