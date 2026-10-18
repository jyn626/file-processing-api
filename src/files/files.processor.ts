import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { FileMetadataService } from '../file-metadata/file-metadata.service';
import { HashService } from '../hash/hash.service';
import { CategorizeService } from 'src/categorize/categorize.service';
import { db } from 'src/db';
import { files } from 'src/db/schema';
import { eq, and } from 'drizzle-orm';
import { FilesService } from './files.service';
import { processingJobs } from '../db/schema'

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

    if (!file) {
      throw new Error('File is not saved from disk.');
    }

    // first get file hash
    const hash = await this.hashService
      .getSHA256(file.path)
      // .catch(async (error) => {
      //   // hashing failes
      //   console.log(error);
      //   await this.fileService.deleteFromDisks(file.path);
      //   await this.fileService.delete(fileId, user.id);
      //   throw new HttpException('Hashing failed.', HttpStatus.BAD_REQUEST);
      // });

    // check if the file exists base on hash
    const exists = await this.hashService.getDuplicates(hash);

    console.log('-- exists: ', exists.length);
    console.log(exists);
    // reject duplicates
    if (exists.length > 0) {
      const duplicate = exists.filter((f) => f.userId === userId);
      console.log('duplicate ', duplicate)
      if (duplicate.length) {
        // delete file from disk
        // await Fs.rm(file.path, { force: true });
        await this.fileService.deleteFromDisks(file.path);
        // delete record from dn
        await this.fileService.delete(fileId, userId);
        // send error
        throw new Error(
          'File already exists, duplicates are not supported.'
        );
      }
    }

    // save the hash
    await this.fileService.saveHash(fileId, hash, userId);

    // get and save category
    const category = await this.categorizeService.store(fileId, file.path);
    console.log('file category --', category);

    // get and save metedata
    await this.fileMetadataService.saveMetadata(file.path, fileId);

    return { success: true, action: 'Process hashing, extracting metada, and getting file category.' };
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    console.log(`Job ${job.id} completed successfully.`);

    await db.update(processingJobs)
      .set({
        status: 'COMPLETED'
      })
      .where(
        and(eq(processingJobs.fileId, job.data.fileId), eq(processingJobs.userId, job.data.userId))
      )

  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed with error: ${error.message}`);
    console.log(job.data.fileId)
    console.log(job.data.userId)

  await db.update(processingJobs)
      .set({
        status: 'FAILED',
        errorMessage: error.message
      })
      .where(
        and(eq(processingJobs.fileId, job.data.fileId), eq(processingJobs.userId, job.data.userId))
      )

  }
}
