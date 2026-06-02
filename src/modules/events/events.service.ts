import { Injectable } from '@nestjs/common';
import { EventJobStatus } from './enum/event-job-status.enum';
import { Model } from 'mongoose';
import { EventJob, EventJobDocument } from './schema/event-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConcurrencyService } from '../../common/concurrency/concurrency.service';
import { PinoLogger } from 'nestjs-pino';
import { JobStats } from './interface/job-stats.interface';
import { CreateJobResponse } from './interface/create-job-response.interface';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(EventJob.name)
    private readonly model: Model<EventJobDocument>,
    @InjectQueue('event-queue')
    private readonly queue: Queue,
    private readonly concurrency: ConcurrencyService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(EventsService.name);
  }

  public async createJob(): Promise<CreateJobResponse> {
    const userId = this.getUserId();

    await this.concurrency.acquire(userId);

    this.logger.info({ userId }, 'Creating job');

    const job = await this.model.create({
      userId,
      status: EventJobStatus.Pending,
      retries: 0,
      result: {},
    });

    this.logger.info({ jobId: job._id }, 'Job created');

    await this.queue.add('process-event', {
      jobId: job._id.toString(),
      userId,
    });

    this.logger.info({ jobId: job._id }, 'Job queued');

    return {
      success: true,
      jobId: job._id,
      status: job.status,
    };
  }

  public async getStats(): Promise<JobStats> {
    const resArray = await this.model.aggregate<JobStats>([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          avgRetries: { $avg: '$retries' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    const [res] = resArray;

    return (
      res ?? {
        total: 0,
        successful: 0,
        failed: 0,
        avgRetries: 0,
      }
    );
  }

  private getUserId(): string {
    return 'test-user';
  }
}
