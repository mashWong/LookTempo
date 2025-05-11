import { Injectable } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterAuthService {
    private readonly client: TwitterApi;
    // private readonly callbackUrl: 'http://localhost:5173/api/auth/twitter/redirect';
    private readonly callbackUrl: 'https://looktempo.giize.com/api/auth/twitter/redirect';

    constructor() {
        this.client = new TwitterApi({
            // 测试
            // clientId: 'bC1jYk1INWdkRkU5VjlUYXBESk46MTpjaQ',
            // clientSecret: '9ZOez2eRjejvTmKMDdPt5IneSZd7QCSliM4r5Rb8NLiRoGSLmw',
            // 正式
            clientId: 'UVJnX3RJanRxdGV2Q2JnRG9xd2s6MTpjaQ',
            clientSecret: '7vjJpoJe60jc9-E8hxdV_rLKffXd0ZZYQA9z6oVgd_FRv3DsEx',
        })
    }

    // 生成授权链接
    async generateAuthUrl() {
        const { url, codeVerifier, state } = this.client.generateOAuth2AuthLink(
            'https://looktempo.giize.com/api/auth/twitter/redirect',
            {
                scope: ['tweet.read', 'users.read', 'offline.access'],
            }
        );

        return { url, codeVerifier, state };
    }

    // 处理回调
    async handleCallback(callbackParams: {
        code: string;
        state: string;
        codeVerifier: string;
    }) {
        const { code, state, codeVerifier } = callbackParams;

        // 验证 state（防止 CSRF）
        // 这里需要从存储中验证 state 是否匹配

        const { accessToken, refreshToken } = await this.client.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: 'https://looktempo.giize.com/api/auth/twitter/redirect',
        });

        // 创建已认证客户端
        const authenticatedClient = new TwitterApi(accessToken);

        // 获取用户信息
        const { data: user } = await authenticatedClient.v2.me({
            "user.fields": ["profile_image_url"]
        });

        return {
            userId: user.id,
            username: user.username,
            name: user.name,
            avatar: user.profile_image_url?.replace('_normal', ''),
            accessToken,
            refreshToken
        };
    }
}