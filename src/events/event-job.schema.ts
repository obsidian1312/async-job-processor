import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EventJobStatus } from './enum/event-job-status.enum';

export type EventJobDocument = HydratedDocument<EventJob>;

@Schema({
  timestamps: true,
})
export class EventJob {
  @Prop({
    required: true,
    index: true,
  })
  jobId!: string;

  @Prop({
    required: true,
    enum: Object.values(EventJobStatus),
  })
  status!: EventJobStatus;

  @Prop({
    type: Object,
    default: {},
  })
  result!: Record<string, unknown>;

  @Prop({
    default: 0,
  })
  retries!: number;
}

export const EventJobSchema = SchemaFactory.createForClass(EventJob);
