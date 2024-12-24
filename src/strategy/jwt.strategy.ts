import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: any) => {
                const parts = request.headers.cookie.split(`; ${'Authentication'}=`);
                const token = parts.pop().split(';').shift().replace('Authentication=', '');
                return token;
            }]),
            ignoreExpiration: false,
            secretOrKey: '000000',
        });
    }

    async validate(payload: any) {
        return payload;
    }
}