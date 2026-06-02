import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import loggerConfig from '../config/logger.config';

@Module({
    imports: [
        LoggerModule.forRootAsync({
            imports: [ConfigModule.forFeature(loggerConfig)],
            inject: [loggerConfig.KEY],
            useFactory: async (config: ConfigType<typeof loggerConfig>) => {
                return {
                    forRoutes: ['*path'],
                    pinoHttp: {
                        level: config.level,
                        redact: ['req.headers.authorization'],
                        serializers: {
                            req: (req) => ({
                                method: req.method,
                                url: req.url,
                            }),
                            res: (res) => ({
                                statusCode: res.statusCode,
                            }),
                        },

                        transport: !config.isProduction
                            ? {
                                target: config.target,
                                options: {
                                    singleLine: config.singleLine,
                                    colorize: config.colorize,
                                    translateTime: config.translateTime,
                                    ignore: config.ignore,
                                    messageFormat: config.messageFormat,
                                },
                            }
                            : undefined,
                    },
                };
            },
        })
    ],
    exports: [LoggerModule],
})
export class LoggingModule { }
