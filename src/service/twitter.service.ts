import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-twitter';

@Injectable()
export class TwitterService extends PassportStrategy(Strategy, 'twitter') {
    // AAAAAAAAAAAAAAAAAAAAAH0OxgEAAAAAkgW%2BuFb0sHsm8gVpIoe0%2B3yZcHg%3DUEVsPytEz2ILnZ6E6OvBwSIKHMhCh9HARMDOkZ2t0sCZlJRPHO
    constructor() {
        super({
            consumerKey: '3FWN0UwgIAbm3WfyT2vzryHFP',
            consumerSecret: 'jYgv6Vlng2fc34Dr9fglu5bw2y0UqWFnN85jdirsY4yKuIv7te',
            callbackURL: 'http://looktempo.giize.com/api/auth/twitter/redirect',
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, username, displayName, photos } = profile;
        const user = {
            userId: id,
            username: username,
            displayName: displayName,
            photo: photos[0].value,
        };
        done(null, user);
    }
}