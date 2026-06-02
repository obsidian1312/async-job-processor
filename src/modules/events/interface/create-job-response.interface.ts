import { Types } from 'mongoose';
import { EventJobStatus } from '../enum/event-job-status.enum';

export interface CreateJobResponse {
  success: boolean;
  jobId: Types.ObjectId;
  status: EventJobStatus;
}
