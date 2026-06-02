import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './modules/events/events.module';
import { RedisModule } from './common/concurrency/redis.module';
import concurrencyConfig from './common/config/concurrency.config';
import databaseConfig from './common/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [concurrencyConfig, databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: async (config: ConfigType<typeof databaseConfig>) => ({
        uri: config.mongoURI,
      }),
    }),

    EventsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
