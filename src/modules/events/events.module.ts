import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventJob, EventJobSchema } from './schema/event-job.schema';
import { BullModule } from '@nestjs/bullmq';
import { EventsProcessor } from '../../events.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventJob.name, schema: EventJobSchema }
    ]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'event-queue',
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsProcessor],
})
export class EventsModule { }
