import {
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { Readable } from 'stream';
import * as csv from 'fast-csv';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { UserData } from './user-data.entity';

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

          // TODO:
          // insert database
          await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(UserData)
            .values(row)
            .execute();
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .on('end', (rowCount: number) => {
          res.end(JSON.stringify(headers));
        });
    });
  }

  @Get('data')
  @HttpCode(HttpStatus.OK)
  async getData() {}
}
