import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-twitter';

@Injectable()
export class TwitterService extends PassportStrategy(Strategy, 'twitter') {
    // AAAAAAAAAAAAAAAAAAAAAH0OxgEAAAAAkgW%2BuFb0sHsm8gVpIoe0%2B3yZcHg%3DUEVsPytEz2ILnZ6E6OvBwSIKHMhCh9HARMDOkZ2t0sCZlJRPHO
    constructor() {
        super({
            consumerKey: 'ZyQJKae9Jf2gvbKW3P5tsqTW1',
            consumerSecret: 'dZB1aMe5sFx7QtEH5eHdiKLgjpT9X8TZBzLwJNNOcxba32Ksw7',
            callbackURL: 'http://localhost:5173/api/auth/twitter/redirect',
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