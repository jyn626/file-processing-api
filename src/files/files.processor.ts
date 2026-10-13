import { Processor, WorkerHost} from '@nestjs/bullmq';
import { Job } from 'bullmq'
import { Injectable } from '@nestjs/common';


@Injectable()
@Processor('file-queue') 
export class FilesProcessor extends WorkerHost {
  async process(job: Job<any>) : Promise<unknown> {

    console.log(`-  Job: ${job.name}`);

    return { success: true };
  }
}
