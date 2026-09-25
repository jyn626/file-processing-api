import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileMetadataService } from 'src/file-metadata/file-metadata.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HashService } from 'src/hash/hash.service';
import { access, constants } from 'node:fs/promises';
import { CategorizeService } from 'src/categorize/categorize.service';
import { CategoryOverrideDto } from './dtos/category-override.dto';
import { GetFilesQueryDto } from './dtos/get-files-query.dto';
import { JwtGuard } from 'src/guards/auth/passport.jwt.guard';
import { OwnershipGuard } from 'src/guards/ownership/ownership.guard';
import { PositiveNumberPipe } from 'src/pipes/positive-number/positive-number.pipe';

export interface AuthenticatedRequest {
  user: {
    username: string;
    id: number;
  };
}

@Controller('files')
export class FilesController {
  constructor(
    private fileService: FilesService,
    private fileMetadataService: FileMetadataService,
    private hashService: HashService,
    private categoryService: CategorizeService,
  ) { }
  // TODO: refactor so that itll only manage files which belonges to the logged in user.
  @Get('/test')
  test() {
    return 'hello';
  }

  // GET /files
  @Get()
  @UseGuards(JwtGuard)
  async findAll(
    @Request() request: AuthenticatedRequest,
    @Query() queries: GetFilesQueryDto,
  ) {
    return await this.fileService.findAll(queries, request.user.id);
  }

  // GET /files/:id
  @Get(':id')
  @UseGuards(JwtGuard, OwnershipGuard)
  async findOne(@Param('id', PositiveNumberPipe) id: number) {
    return await this.fileService.findOne(id);
  }

  // GET /files/:extension
  @Get(':extension')
  @UseGuards(JwtGuard)
  findByExtension(@Param('extension') _extension: string) { }

  // POST /files
  @UseInterceptors(
    FileInterceptor('file', {
      // FileInterceptor('file') handles the multipart field
      storage: diskStorage({
        destination: './uploads',

        filename: (_req, file, cb) => {
          const extension = extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

          cb(null, filename);
        },
      }),
    }),
  )
  @Post()
  @UseGuards(JwtGuard)
  // ! TODO: refactor, maybe change the order so the temporary DB storing is not needed (?)
  // ! maybe add some state in schema: incomplete, complete (?)
  // !  see where will this fail later.
  async upload(
    @Request() request: AuthenticatedRequest,
    @UploadedFile('file') file: Express.Multer.File,
  ) {
    const user = request.user;
    // and @UploadedFile() retrieves the resulting file object.
    // temporarily store the file and see if there's any duplicate
    const fileId = await this.fileService.upload(
      file.originalname,
      file.path,
      user.id,
    );
    try {
      // before proceeding to hash, make sure the file is saved in the disk
      // the file could theoretically disappear between Multer finishing and your hashing operation.
      await access(file.path, constants.F_OK);

      // after the file upload is complete, compute hash and check if it already exists
      const newFileHash = await this.hashService
        .getSHA256(file.path)
        .catch(async (error) => {
          // hashing failes
          console.log(error);
          await this.fileService.deleteFromDisks(file.path);
          await this.fileService.delete(fileId, user.id);
          throw new HttpException('Hashing failed.', HttpStatus.BAD_REQUEST);
        });

      const exists = await this.hashService.getDuplicates(newFileHash);

      console.log('-- exists: ', exists.length);
      console.log(exists);
      // reject duplicates
      if (exists.length > 0) {
        // delete file from disk
        // await Fs.rm(file.path, { force: true });
        await this.fileService.deleteFromDisks(file.path);
        // delete record from dn
        await this.fileService.delete(fileId, user.id);
        // send error
        throw new HttpException(
          'File already exists, duplicates are not supported.',
          HttpStatus.CONFLICT,
        );
      }
      // save the hash
      await this.fileService.saveHash(fileId, newFileHash, user.id);

      // get and save category
      const category = await this.categoryService.store(fileId, file.path);
      console.log('file category --', category);

      // get and save metadata
      await this.fileMetadataService.saveMetadata(file.path, fileId);
      // if theyre arent duplicates then store the file.
      return {
        message: 'Upload successfull.',
        filepath: file.path,
      };
    } catch (error: any) {
      // ! TODO: confirm this is working.
      console.log(error);
      // means the `access()` failed, which again means the file is not found from the disk
      if (error instanceof Error && 'code' in error && error.code == 'ENOENT') {
        throw new HttpException('File not found.', HttpStatus.NOT_FOUND);
      }
      throw error;
      // // handle error where the DB failed
      // if (error instanceof DrizzleError) {
      //   // if the DB failed, then delete the file.
      //   await Fs.rm(file.path, { force: true });
      // }
    }
  }

  // DELETE /files/clear
  // @Delete('/clear')
  // @UseGuards(JwtGuard)
  // async clear() {
  //   return await this.fileService.clear();
  // }

  // DELETE /files/:id
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Request() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.fileService.delete(id, request.user.id);
  }

  // POST /files/:id/analyze
  @Get(':id/analyze')
  @UseGuards(JwtGuard, OwnershipGuard)
  async analyze(
    @Request() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const file = await this.findOne(id);

    return this.fileMetadataService.read(file.path);
  }

  // POST /files/:id/hash
  @Post(':id/hash')
  @UseGuards(JwtGuard, OwnershipGuard)
  async storeHash(
    @Request() request: AuthenticatedRequest,
    @Param('id') id: number,
  ) {
    const file = await this.findOne(id);
    const hash = await this.hashService.getSHA256(file.path);
    await this.fileService.saveHash(id, hash, request.user.id);
    return {
      message: 'Hash successfull.',
      hash,
    };
  }

  // POST /files/:id/category/override
  // override category
  @Post(':id/category/override')
  @UseGuards(JwtGuard)
  async categoryOverride(
    @Body() categoryOverrideDto: CategoryOverrideDto,
    @Param('id') id: number,
  ) {
    console.log(categoryOverrideDto);
    return await this.categoryService.update(id, categoryOverrideDto.category);
  }
}
