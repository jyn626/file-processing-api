import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileMetadataService } from 'src/file-metadata/file-metadata.service';
import { HashService } from 'src/hash/hash.service';
import { CategorizeService } from 'src/categorize/categorize.service';
import { BullModule } from '@nestjs/bullmq'
import { FilesProcessor } from './files.processor'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'file-queue' })
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    FileMetadataService,
    HashService,
    CategorizeService,
    FilesProcessor, 
  ],
})
export class FilesModule { }
