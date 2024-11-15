import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
    private readonly logger = new Logger(IpFilterMiddleware.name);
    use(req: any, res: any, next: () => void) {
        const ip = req.ip || req.connection.remoteAddress;
        let ipInfo = geoip.lookup(ip);

        this.logger.log('ipInfo:', ipInfo);
        if (ipInfo.country !== 'CN') {
            next();
        } else {
            this.logger.error('IP not allowed:', ip);
            res.status(403).send('Forbidden');
        }
    }
}