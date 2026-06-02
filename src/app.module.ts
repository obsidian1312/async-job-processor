import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './modules/events/events.module';
import { RedisModule } from './common/concurrency/redis.module';

import concurrencyConfig from './common/config/concurrency.config';
import databaseConfig from './common/config/database.config';
import { LoggingModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [concurrencyConfig, databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        uri: config.mongoURI,
      }),
    }),

    EventsModule,
    RedisModule,
    LoggingModule,
  ],
})
export class AppModule {}
