import { Controller, Get, Res, Request } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import * as path from 'path';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('list')
  async getPngFiles(@Request() req, @Res() res: Response): Promise<Response> {

    try {
      const files = await this.appService.getPngFiles();
      return res.json({ files });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}