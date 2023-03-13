import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/Ballot.json';
import * as dotenv from 'dotenv';
dotenv.config();
import { ConfigService } from '@nestjs/config';
import {
  TransactionErrorDTO,
  TransactionResponseDTO,
} from './dtos/requestToken.dto';

const API_KEY = process.env.ALCHEMY_API_KEY;
const NETWORK = process.env.NETWORK;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TKN_CONTRACT = process.env.MY_TKN_ADDRESS;
const BALLOT_ADDRESS = process.env.BALLOT_ADDRESS;

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  tokenContract: ethers.Contract;
  ballotContract: ethers.Contract;
  network: string;
  contractAddress: string;
  ballotAddress: string;
  Votes: Array<any>;
  public config: ConfigService;
  signer: ethers.Wallet;

  constructor() {
    if (TKN_CONTRACT && PRIVATE_KEY && API_KEY && NETWORK && BALLOT_ADDRESS) {
      this.contractAddress = TKN_CONTRACT;
      this.ballotAddress = BALLOT_ADDRESS;
      this.provider = ethers.providers.getDefaultProvider(NETWORK, {
        alchemy: API_KEY,
      });
      this.tokenContract = new ethers.Contract(
        this.contractAddress,
        tokenJson.abi,
        this.provider,
      );
      this.ballotContract = new ethers.Contract(
        this.ballotAddress,
        ballotJson.abi,
        this.provider,
      );
      this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    }
    console.log(this.ballotContract);
  }
  counter = 0;
  getHello(): string {
    const databaseName = this.config.get('DATABASE_NAME');
    console.log({ databaseName });
    return 'Hello World!' + this.counter++;
  }
  getContractAddress(): string {
    return this.contractAddress;
  }
  getBallotAddress(): string {
    return this.ballotAddress;
  }
  async getTotalSupply(): Promise<number> {
    const totalSupplyBN: BigNumber = await this.tokenContract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.tokenContract.getAllowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransaction(
    hash: string,
  ): Promise<ethers.providers.TransactionResponse> {
    return this.provider.getTransaction(hash);
  }

  async getBalanceOf(address: string): Promise<number> {
    const balanceBN = await this.tokenContract.balanceOf(address);
    const balanceStr = ethers.utils.formatEther(balanceBN);
    const balance = parseFloat(balanceStr);
    return balance;
  }
  async requestTokens(
    address: string,
    amount: string,
  ): Promise<TransactionResponseDTO | TransactionErrorDTO> {
    let txError = null;
    let txReceipt = null;
    const tkn_amount = ethers.utils.parseEther(amount);
    try {
      const txHash = await this.tokenContract
        .connect(this.signer)
        .mint(address, tkn_amount);
      txReceipt = txHash.wait();
    } catch (error) {
      txError = error;
    }
    if (txError) {
      return {
        message: `🚫 Error while minting tokens to ${address}`,
        details: JSON.stringify(txError),
      };
    }
    return {
      message: `🍾 Successfully minted ${amount} MTK to ${address}.`,
      transactionHash: txReceipt.transactionHash,
      etherscan: `https://goerli.etherscan.io/tx/${txReceipt.transactionHash}`,
    };
  }
  async getVotingPower(address: string): Promise<number> {
    const votingPowerBN = await this.ballotContract.votingPower(address);
    const votingPowerStr = ethers.utils.formatEther(votingPowerBN);
    const votingPower = parseFloat(votingPowerStr);
    return votingPower;
  }
}
