import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { AuthController } from '../controller/auth.controller';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { JwtGuard } from '../strategy/jwt.guard';
import { PayPalService } from '../service/paypal.service';
import { Feedback } from '../entities/feedback.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Feedback]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: '000000',
            signOptions: { expiresIn: '7 days' },
        }),
    ],
    providers: [UserService, JwtStrategy, JwtGuard, UserService, PayPalService],
    controllers: [AuthController],
    exports: [JwtGuard, UserService],
})
export class UserModule { }