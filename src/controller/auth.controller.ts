import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
    @Get('twitter')
    @UseGuards(AuthGuard('twitter'))
    async twitterLogin(@Req() req: Request) {

        console.log(req);
        // 此方法会触发认证流程
    }

    @Get('twitter/redirect')
    @UseGuards(AuthGuard('twitter'))
    async twitterLoginRedirect(@Req() req, @Res() res) {
        req.session.user = req.user;
        console.log(req.user);
        res.redirect('http://localhost:5173'); // 这里可以根据你的需求返回或处理用户数据
    }
}