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
        'IVE - I AM.avif',
        'Illusion - DuaLipa.avif',
        'TOO BAD - GD.avif',
        'UP - KARINA.avif',
        'Really Like You - BABYMONSTER.avif',
        'MINNIE - HER.avif',
        'AOA - like a cat.avif',
        'IVE - REBEL HEART.avif',
        "Girls' Generation - taxi.avif",
        'Amateur - Nice Body.avif',
        'ITZY - WANNABE.avif',
        'Jun Hyoseong - Into you.avif',
        'Red Velvet X Aespa - Beautiful Christmas.avif',
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
