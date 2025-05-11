import { Controller, Get, Req, Res, UseGuards, Query, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { PayPalService } from '../service/paypal.service';
import { TwitterAuthService } from '../service/twitter.service';
import { Request, Response } from 'express';


@Controller('api/auth')
export class AuthController {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private twitterAuth: TwitterAuthService,
        private paypalService: PayPalService
    ) { }

    @Get('twitter')
    async twitterLogin(@Req() req: Request, @Res() res: Response) {
        const { url, codeVerifier, state } = await this.twitterAuth.generateAuthUrl();

        // 存储认证数据到session
        (req.session as any).authData = { codeVerifier, state };
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                resolve(true);
            });
        });

        res.redirect(url);
    }

    @Get('twitter/redirect')
    async twitterLoginRedirect(
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {

        // 1. 从 session 中获取存储的 codeVerifier 和 state
        const sessionData = (req.session as any).authData;
        console.log('sessionData: ', sessionData);

        // 2. 处理Twitter回调
        const twitterUser = await this.twitterAuth.handleCallback({
            code,
            state,
            codeVerifier: sessionData.codeVerifier
        });
        console.log('twitterUser: ', twitterUser);

        // 3. 创建/更新本地用户
        const localUser = await this.handleAccount({
            userId: twitterUser.userId,
            displayName: twitterUser.name,
            photo: twitterUser.avatar
        });

        // 4. 生成JWT
        const token = this.jwtService.sign(
            {
                userId: twitterUser.userId,
            },
            {
                expiresIn: '30d' // 设置30天有效期
            }
        );

        // 5. 返回前端,通过Cookie返回（更安全）
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
            sameSite: 'strict'
        });
        res.redirect('/'); // 重定向到前端页面
    }

    async handleAccount(user: any): Promise<User | null> {

        let userInfo = await this.userService.findOneByUserId(user.userId);
        if (!userInfo) {
            let newUser = <User>{};
            newUser.userId = user.userId;
            newUser.name = user.displayName;
            newUser.avatar = user.photo;
            let newUserInfo = await this.userService.create(newUser);
            return newUserInfo;
        } else {
            return userInfo;
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req, @Res() res, @Query('souces') souces: string) {
        this.userService.findOneByUserId(req.user.userId).then(info => {

            if (info === null) {
                res.status(401).send('no way');
                return;
            }

            // 写入souces
            if (info.source.length === 0 && souces) {
                this.userService.updateSouces(req.user.userId, souces);
            }

            if (info.subscribed !== '0') {
                // 检测订阅状态
                this.paypalService.querySubscription(info.subscribed).then(subscription => {
                    if (subscription.status === 'ACTIVE') {
                        this.userService.updatePayment(req.user.userId, info.subscribed);
                        res.json(info);
                    } else {
                        this.userService.updatePayment(req.user.userId, '0');
                        info.subscribed = '0';
                        info.checkSubTime = '';
                        res.json(info);
                    }
                });
            } else {
                res.json(info);
            }
        });
    }

    @Post('feedback')
    @UseGuards(AuthGuard('jwt'))
    async doFeedback(@Body() body: { content: string }, @Req() @Req() req) {
        if (body.content) this.userService.addFeedback(body.content, req.user);
        return 'ok'
    }

    @Post('editUserSubscribed')
    @UseGuards(AuthGuard('jwt'))
    async editUserSubscribed(@Body() body: {
        subscribeId: string,
        userId: string
    }, @Req() req, @Res() res) {
        // 检查用户权限
        if (req.user.userId !== '1838518568184610816') {
            res.status(403).send('no way')
            return
        }
        // 是否取消订阅
        if (body.subscribeId === '0') {
            // 取消订阅
            this.userService.updatePayment(body.userId, '0');
            res.status(200).send('ok')
            return;
        }
        // 检查subscribeId是否正确
        this.paypalService.querySubscription(body.subscribeId).then(subscription => {
            console.log('subscription: ', subscription);
            if (subscription.status === 'ACTIVE') {
                this.userService.updatePayment(body.userId, body.subscribeId);
                res.status(200).send('ok')
            } else {
                res.status(403).send('subscribeId is not correct')
            }
        });
    }
}