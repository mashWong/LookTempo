import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly directoryPath = path.join(__dirname, '../static'); // 指定文件夹路径

  async getPngFiles(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.directoryPath);
      const mapFiles = [
        'Red Velvet X Aespa - Beautiful Christmas.avif',
        'Jun Hyoseong - Into you.avif',
        'T-ARA - 숨바꼭질.avif',
        'jennie - Mantra.avif',
        'Miniskirt - AOA.avif',
        'girls - aespa.avif',
        'Whiplash - aespa.avif',
        'LIKE THAT - BABYMONSTER.avif',
        'FOREVER - BABYMONSTER.avif'
      ];
      const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.avif');

      return mapFiles.filter(file => pngFiles.includes(file));

      // return files.filter(file => path.extname(file).toLowerCase() === '.avif');
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }
}
