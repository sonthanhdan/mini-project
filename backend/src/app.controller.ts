import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Readable } from 'stream';
import * as csv from 'fast-csv';
import { Response } from 'express';
import { DataSource, FindManyOptions, Like } from 'typeorm';
import { AppService } from './app.service';
import { UserData } from './user-data.entity';
import { isNumeric } from './utils';
import { Promise as BPromise } from 'bluebird';
import { chunk } from 'lodash';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv' })],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const stream = Readable.from(file.buffer);

    await new Promise((resolve, reject) => {
      const results = [];
      let headers: Record<string, unknown>[] = [];
      stream
        .pipe(
          csv.parse({
            headers: true,
            ignoreEmpty: true,
            delimiter: ',',
            trim: true,
          }),
        )
        .on('error', (error) => {
          reject(error);
        })
        .on('headers', (rows: Record<string, unknown>[]) => {
          headers = rows;
        })
        .on('data', async (row: UserData) => {
          results.push(row);
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .on('end', (rowCount: number) => {
          // TODO: chunk data bulk insert
          const CHUNK_SIZE = 50;
          BPromise.all(
            chunk(results, CHUNK_SIZE),
            (items: UserData[]) => {
              this.dataSource
                .createQueryBuilder()
                .insert()
                .into(UserData)
                .values(items)
                .execute();
            },
            { concurrency: CHUNK_SIZE },
          );

          res.end(JSON.stringify(headers));
        });
    });
  }

  @Get('records')
  @HttpCode(HttpStatus.OK)
  async getUploadedRecords(
    @Query()
    query: {
      keyword?: string;
      limit?: number;
      page?: number;
    },
  ): Promise<any> {
    const take = query.limit || 10;
    const skip = query.page || 0;
    const keyword = query.keyword || '';

    const filters: FindManyOptions<UserData> = {
      order: { id: 'DESC' },
      take,
      skip,
    };

    if (keyword.length) {
      filters.where = [
        { name: Like('%' + keyword + '%') },
        { email: Like('%' + keyword + '%') },
      ];

      if (isNumeric(keyword)) {
        filters.where.push({ postId: +keyword });
      }
    }

    const [results, total] = await this.dataSource
      .getRepository(UserData)
      .findAndCount(filters);

    return {
      results,
      total,
    };
  }
}
