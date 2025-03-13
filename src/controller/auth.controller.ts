import { Controller, Get, Req, Res, UseGuards, Query, Request, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/service/user.service';
import { PayPalService } from 'src/service/paypal.service';

@Controller('api/auth')
export class AuthController {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private paypalService: PayPalService
    ) { }

    @Get('twitter')
    @UseGuards(AuthGuard('twitter'))
    async twitterLogin() {
        // 此方法会触发认证流程
    }

    @Get('twitter/redirect')
    @UseGuards(AuthGuard('twitter'))
    async twitterLoginRedirect(@Req() req, @Res() res) {
        const token = this.jwtService.sign({ userId: req.user.userId });
        res.cookie('Authentication', token, {
            httpOnly: true,
        });

        this.handleAccount(req.user).then(() => {
            res.redirect('http://looktempo.giize.com/');
            // res.redirect('http://localhost:5173');
        })
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
    async getProfile(@Request() req, @Res() res, @Query('souces') souces: string) {
        this.userService.findOneByUserId(req.user.userId).then(info => {

            if (info === null) {
                res.status(401).send('no way');
                return;
            }

            // 写入souces
            if (info.source.length === 0 && souces) {
                this.userService.updateSouces(req.user.userId, souces);
            }

            if (info.subscribed !== '0' && new Date().getTime() - parseInt(info.checkSubTime) > (1000 * 60 * 60 * 24)) {
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
    async doFeedback(@Body() body: { content: string }, @Req() @Request() req) {
        if (body.content) this.userService.addFeedback(body.content, req.user);
        return 'ok'
    }

    @Post('editUserSubscribed')
    @UseGuards(AuthGuard('jwt'))
    async editUserSubscribed(@Body() body: {
        subscribeId: string,
        userId: string
    }, @Req() @Request() req, @Res() res) {
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