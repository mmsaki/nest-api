import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PaymentOrder } from './payment.Order.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/contract-address')
  getContractAddress(): string {
    return this.appService.getContractAddress();
  }

  @Get('total-supply')
  getTotalSupply(): Promise<number> {
    return this.appService.getTotalSupply();
  }
  @Get('allowance')
  getAllowance(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<number> {
    return this.appService.getAllowance(from, to);
  }

  @Get('transaction/:hash')
  getTransaction(@Param('hash') hash: string) {
    return this.appService.getTransaction(hash);
  }

  @Get('payment-orders')
  getPaymentOrders() {
    return this.appService.getPaymentOrders();
  }

  @Post('payment-order')
  createPaymentOrder(@Body() body: PaymentOrder) {
    return this.appService.createPaymentOrder(body.value, body.secret);8b9 (I added getContractAddress() function)
  }
}
