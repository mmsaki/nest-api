import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestTokensDTO, VotingPowerDTO } from './dtos/requestToken.dto';
import { BigNumber } from 'ethers';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('contract-address')
  getContractAddress(): { result: string } {
    return { result: this.appService.getContractAddress() };
  }
  @Get('ballot-contract')
  getBallotContract(): { result: string } {
    return { result: this.appService.getBallotAddress() };
  }
  @Get('total-supply')
  getTotalSupply(): { result: Promise<number> } {
    return { result: this.appService.getTotalSupply() };
  }
  @Get('allowance')
  getAllowance(
    @Query('from') from: string,
    @Query('to') to: string,
  ): { result: Promise<number> } {
    return { result: this.appService.getAllowance(from, to) };
  }

  @Post('voting-power/:address')
  async getVotingPower(@Query('address') address: string) {
    return { result: this.appService.getVotingPower(address) };
  }
  @Post('balance-of/:address')
  getBalanceOf(@Query('address') address: string) {
    return { result: this.appService.getBalanceOf(address) };
  }
  @Get('transaction/:hash')
  getTransaction(@Param('hash') hash: string) {
    return this.appService.getTransaction(hash);
  }
  @Post('request-tokens/:body')
  requestTokens(@Body() body: RequestTokensDTO) {
    return { result: this.appService.requestTokens(body.address, body.amount) };
  }
}
