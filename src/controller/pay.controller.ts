import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { PayPalService } from '../service/paypal.service';
import { UserService } from '../service/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/payment')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
    constructor(
        private readonly paypalService: PayPalService,
        private readonly userService: UserService,
    ) { }

    @Post('create-product')
    async createProduct(@Body() body: { name: string; description: string }) {
        return this.paypalService.createProduct(body.name, body.description);
    }

    @Get('list-product')
    async listProduct() {
        return this.paypalService.listProduct();
    }

    @Get('list-plan')
    async listPlan() {
        return this.paypalService.listPlan();
    }

    @Post('create-plan')
    async createPlan(@Body() body: { productId: string; planData: any }) {
        return this.paypalService.createPlan(body.productId, body.planData);
    }

    @Post('create-subscription')
    async createSubscription(@Body() body: { subscriberData: any }) {
        return this.paypalService.createSubscription(body.subscriberData);
    }

    @Get('query-subscription')
    async querySubscription(@Query('id') subscriptionId: string) {
        return this.paypalService.querySubscription(subscriptionId);
    }

    @Get('verify-subscription')
    async success(@Query('id') subscriptionId: string, @Req() req) {
        let subscription = await this.paypalService.querySubscription(subscriptionId);
        if (subscription.status === 'ACTIVE') {
            console.log('req: ', req.user.userId);
            // 更新user表状态
            let res = await this.userService.updatePayment(req.user.userId, subscriptionId);
            return res ? 'success' : 'false';
        } else {
            return 'false';
        }
    }

    @Get('cancel')
    async cancel() {
        // 处理取消订阅后的逻辑
        return { message: 'Subscription cancelled' };
    }
}