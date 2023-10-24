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

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
      let headers = [];
      const progress = { total: file.size, uploaded: 0 };
      stream
        .pipe(
          csv.parse({
            headers: true,
          }),
        )
        .on('error', (error) => {
          reject(error);
        })
        .on('headers', (row: any) => {
          headers = row;
          // res.write('[');
        })
        .on('data', (row: { [s: string]: unknown } | ArrayLike<unknown>) => {
          progress.uploaded += Object.values(row).toString().length;
          results.push(row);
          // res.write(JSON.stringify(progress));

          // TODO:
          // insert database
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .on('end', (rowCount: number) => {
          // res.write(
          //   JSON.stringify({
          //     total: file.size,
          //     uploaded: file.size,
          //   }),
          // );
          res.end(JSON.stringify(headers));
        });
    });
  }

  @Get('data')
  @HttpCode(HttpStatus.OK)
  async getData() {}
}
