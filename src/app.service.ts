import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly directoryPath = path.join(__dirname, '../static'); // 指定文件夹路径

  async getPngFiles(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.directoryPath);
      return files.filter(file => path.extname(file).toLowerCase() === '.png');
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }
}
