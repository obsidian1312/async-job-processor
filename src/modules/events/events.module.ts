import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventJob, EventJobSchema } from './schema/event-job.schema';
import { BullModule } from '@nestjs/bullmq';
import { EventsProcessor } from './events.processor';
import { ConcurrencyService } from '../../common/concurrency/concurrency.service';
import { RedisModule } from '../../common/concurrency/redis.module';
import concurrencyConfig from '../../common/config/concurrency.config';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: EventJob.name, schema: EventJobSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(concurrencyConfig)],
      inject: [concurrencyConfig.KEY],
      useFactory: (config: ConfigType<typeof concurrencyConfig>) => ({
        connection: {
          host: config.redisHost,
          port: config.redisPort,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'event-queue',
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsProcessor, ConcurrencyService],
})
export class EventsModule {}
