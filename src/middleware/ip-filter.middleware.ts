import { Injectable, NestMiddleware } from '@nestjs/common';
import * as geoip from 'geoip-lite';

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const ip = req.ip || req.connection.remoteAddress;
        let ipInfo = geoip.lookup(ip);

        if (ipInfo.country !== 'CN') {
            next();
        } else {
            res.status(403).send('Forbidden');
        }

        next();
    }
}