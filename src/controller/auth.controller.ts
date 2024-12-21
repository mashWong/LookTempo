import { Controller, Get, Req, Res, UseGuards, Post, Request } from '@nestjs/common';
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
    async twitterLogin(@Req() req: Request) {
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
            res.redirect('http://localhost:5173');
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
    async getProfile(@Request() req, @Res() res) {
        this.userService.findOneByUserId(req.user.userId).then(info => {

            if (info === null) {
                res.status(401).send('no way');
                return;
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
}