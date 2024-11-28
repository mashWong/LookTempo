import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
    private readonly logger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/info.log', level: 'debug' }),
            new winston.transports.File({ filename: 'logs/combined.log', level: 'info' }),
        ],
    });

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, error: Error) {
        this.logger.error(message, error);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }
}