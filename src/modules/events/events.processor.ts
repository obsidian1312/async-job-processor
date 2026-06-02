import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import { EventJob, EventJobDocument } from './schema/event-job.schema';
import { ConcurrencyService } from '../../common/concurrency/concurrency.service';
import { PinoLogger } from 'nestjs-pino';

@Processor('event-queue')
export class EventsProcessor extends WorkerHost {
  constructor(
    @InjectModel(EventJob.name)
    private readonly model: Model<EventJobDocument>,
    private readonly concurrency: ConcurrencyService,
    private readonly logger: PinoLogger,
  ) {
    super();
    this.logger.setContext(EventsProcessor.name);
  }

  async process(job: Job<{ jobId: string; userId: string }>) {
    const { jobId, userId } = job.data;

    try {
      await this.model.updateOne(
        { _id: jobId },
        { $set: { status: 'processing' } },
      );

      this.logger.info({ jobId }, 'Processing started');

      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2500));

      const success = Math.random() > 0.35;

      if (!success) {
        await this.model.updateOne(
          { _id: jobId },
          {
            $set: { status: 'failed' },
            $inc: { retries: 1 },
          },
        );

        throw new Error('failed');
      }

      await this.model.updateOne(
        { _id: jobId },
        {
          $set: {
            status: 'success',
            result: { success: true },
          },
        },
      );

      this.logger.info({ jobId, success }, 'Processing finished');
    } finally {
      await this.concurrency.release(userId);
    }
  }
}
