import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { B2Service } from './service/B2.service';

@Injectable()
export class AppService {
  private readonly directoryPath = path.join(__dirname, '../static'); // 指定文件夹路径
  private readonly b2Service: B2Service;

  async getPngFiles(): Promise<any[]> {
    try {
      const files = await fs.promises.readdir(this.directoryPath);
      const mapFiles = [];

      const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.avif');

      return mapFiles.filter(file => pngFiles.includes(file));

      return files.filter(file => path.extname(file).toLowerCase() === '.avif');
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }
}
