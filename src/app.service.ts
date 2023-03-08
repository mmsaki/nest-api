import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import { PaymentOrder } from './payment.Order.model';

const CONTRACT_ADDRESS = '0x2C568938035C3964Ef198F5D113885feB767C73F';

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;
  paymentOrders: Array<PaymentOrder>;
  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenJson.abi,
      this.provider,
    );
    this.paymentOrders = [];
  }
  counter = 0;
  getHello(): string {
    return 'Hello World!' + this.counter++;
  }
  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }
  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.contract.getAllowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  getTransaction(hash: string): Promise<ethers.providers.TransactionResponse> {
    return this.provider.getTransaction(hash);
  }

  getPaymentOrders() {
    return this.paymentOrders.map((o) => {
      return { value: o.value, id: o.id };
    });
  }
  createPaymentOrder(value: number, secret: string): number {
    const newPaymentOrder = new PaymentOrder();
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret;
    newPaymentOrder.id = this.getPaymentOrders.length;
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }
  claimPayment(id: number, secret: string, address: string) {
    // TODO
    // Check if secret matches
    // Pick your minter pkey form env
    // create a signer
    // connect the signer
    // connect the signer to the contract
    // mint value to the address
  }
}
