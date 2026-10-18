import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq'
import { db } from '../db'
import { processingJobs } from '../db/schema'


@Injectable()
export class JobsService {
  constructor(@InjectQueue('file-queue') private fileQueue: Queue) { }

  async enqueueFileJob(fileId: number, userId: number) {
    try {
      await db.insert(processingJobs).values({
        status: 'QUEUED',
        userId,
        fileId,
      })

      const job = await this.fileQueue.add(
        'process-file',
        { fileId, userId },
        {
          attempts: 3,
        },
      );

      return {
        message: 'File task enqueued successfully.',
        jobId: job.id
      };
  } catch(error) {
      throw error;
    }
  }

  async getJobs() {
    return await db.query.processingJobs.findMany();
  }
}
