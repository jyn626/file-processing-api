import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { FileMetadataService } from '../file-metadata/file-metadata.service';
import { HashService } from '../hash/hash.service';
import { CategorizeService } from 'src/categorize/categorize.service';
import { db } from 'src/db';
import { files } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { FilesService } from './files.service';

@Injectable()
@Processor('file-queue')
export class FilesProcessor extends WorkerHost {
  constructor(
    private readonly fileMetadataService: FileMetadataService,
    private readonly hashService: HashService,
    private readonly categorizeService: CategorizeService,
    private readonly fileService: FilesService,
  ) {
    super();
  }

  async process(
    job: Job<{ fileId: number; userId: number }>,
  ): Promise<unknown> {
    // console.log(`-  Job data: ${JSON.stringify(job.data)}`)
    const { fileId, userId } = job.data;

    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    // get file metedata
    const metadata = await this.fileMetadataService.saveMetadata(
      file!.path,
      fileId,
    );

    const sha256 = await this.hashService.getSHA256(file!.path);
    await this.fileService.saveHash(file!.id, sha256, userId);

    const category = this.categorizeService.getCategory(file!.path);
    await this.categorizeService.store(file!.id, file!.path);

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
