import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq'
import { Injectable } from '@nestjs/common';
import { FileMetadataService } from '../file-metadata/file-metadata.service'

@Injectable()
@Processor('file-queue') 
export class FilesProcessor extends WorkerHost {
  constructor(private readonly fileMetadataService: FileMetadataService) {
    super()
  }

  async process(job: Job<any>) : Promise<unknown> {
    // console.log(`-  Job data: ${JSON.stringify(job.data)}`)
    
    const result = await this.fileMetadataService.read(job.data.filepath)
    console.log(result) 
    return { success: true, action: 'read metadata' };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed successfully.`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error.message}`)
  }
}
