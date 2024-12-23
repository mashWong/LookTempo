import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import { LoggerService } from '../service/loggers.service';
import * as express from 'express';
import * as path from 'path';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
    constructor(
        // private readonly logger: LoggerService
    ) { }
    use(req: any, res: any, next: () => void) {
        const ip = req.ip || req.connection.remoteAddress;
        let ipInfo = geoip.lookup(ip);

        if (ipInfo && ipInfo.country !== 'CN') {
            next();
        } else {
            // res.status(403).send('Forbidden');
            next();
            // console.log('IP', ip);
            // Logger.log('IP not allowed:', ip);
            // this.logger.error('IP not allowed:', ip);
            // res.status(403).send('Forbidden');
        }
    }
}