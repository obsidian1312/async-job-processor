import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventJob, EventJobSchema } from './schema/event-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventJob.name, schema: EventJobSchema }
    ])
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule { }
