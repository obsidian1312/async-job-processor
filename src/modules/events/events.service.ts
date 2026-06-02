import { Injectable } from '@nestjs/common';
import { EventJobStatus } from './enum/event-job-status.enum';
import { Model } from 'mongoose';
import { EventJob, EventJobDocument } from './schema/event-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConcurrencyService } from '../../common/concurrency/concurrency.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectModel(EventJob.name)
        private readonly model: Model<EventJobDocument>,
        @InjectQueue('event-queue')
        private readonly queue: Queue,
        private readonly concurrency: ConcurrencyService,
    ) { }

    public async createJob() {
        const userId = this.getUserId();

        await this.concurrency.acquire(userId);

        const job = await this.model.create({
            userId,
            status: EventJobStatus.Pending,
            retries: 0,
            result: {},
        });

        await this.queue.add('process-event', {
            jobId: job._id.toString(),
            userId,
        });

        return {
            success: true,
            jobId: job._id,
            status: job.status,
        };
    }

    public async getStats() {
        const [res] = await this.model.aggregate([
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
        ]);

        return (
            res ?? {
                total: 0,
                successful: 0,
                failed: 0,
                avgRetries: 0,
            }
        );
    }

    private getUserId() {
        return 'test-user';
    }
}
