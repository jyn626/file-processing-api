import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { FileMetadataService } from '../file-metadata/file-metadata.service';
import { HashService } from '../hash/hash.service';
import { CategorizeService } from 'src/categorize/categorize.service';

@Injectable()
@Processor('file-queue')
export class FilesProcessor extends WorkerHost {
  constructor(
    private readonly fileMetadataService: FileMetadataService,
    private readonly hashService: HashService,
    private readonly categorizeService: CategorizeService,
  ) {
    super();
  }

  async process(job: Job<{ filepath: string }>): Promise<unknown> {
    // console.log(`-  Job data: ${JSON.stringify(job.data)}`)
    const { filepath } = job.data;
    // get file metedata
    const metadata = this.fileMetadataService.read(filepath);
    const sha256 = await this.hashService.getSHA256(filepath);
    const category = this.categorizeService.getCategory(filepath);
    const result = {
      ...metadata,
      hash: sha256,
      category,
    };

    console.log(result);

    return { success: true, result };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error.message}`);
  }
}
