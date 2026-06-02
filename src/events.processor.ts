import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import { EventJob, EventJobDocument } from './modules/events/schema/event-job.schema';

@Processor('event-queue')
export class EventsProcessor extends WorkerHost {
    constructor(
        @InjectModel(EventJob.name)
        private readonly model: Model<EventJobDocument>,
    ) {
        super();
    }

    async process(job: Job<{ jobId: string }>) {
        const { jobId } = job.data;

        await this.model.updateOne(
            { _id: jobId },
            { $set: { status: 'processing' } },
        );

        await new Promise((r) =>
            setTimeout(r, 1500 + Math.random() * 2500),
        );

        const success = /* Math.random() > 0.35 */false;

        console.log('PROCESSING JOB', job.data.jobId);

        if (success) {
            await this.model.updateOne(
                { _id: jobId },
                {
                    $set: {
                        status: 'success',
                        result: { success: true, data: 'Task completed' },
                    },
                },
            );
        } else {
            await this.model.updateOne(
                { _id: jobId },
                {
                    $set: {
                        status: 'failed',
                        result: { success: false },
                    },
                    $inc: { retries: 1 },
                },
            );

            throw new Error('Job failed');
        }
    }
}
