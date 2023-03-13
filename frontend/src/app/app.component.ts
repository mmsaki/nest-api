import { Component } from '@angular/core';
import { BigNumber, Contract, Wallet, ethers, utils } from 'ethers';
import { HttpClient } from '@angular/common/http';
import tokenJson from '../assets/MyToken.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'app';
  blockNumber: number | string | undefined;
  userWallet: Wallet | undefined;
  userAddress: string | undefined;
  signer: ethers.Signer | undefined;
  provider: ethers.providers.BaseProvider;
  isWalletConnected: boolean | undefined;
  userBalance: number | undefined;
  userTokenBalance: number | undefined;
  tokenContractAddress: string | undefined;
  tokenContract: Contract | undefined;
  tokenSupply: number | undefined;

  TOKEN_ADDRESS_API_URL = 'http://localhost:3000/contract-address';
  TOKEN_MINT_API_URL = 'http://localhost:3000/request-tokens';
  VOTING_POWER_API_URL = 'http://localhost:3000/voting-power';

  constructor(private http: HttpClient) {
    this.provider = ethers.providers.getDefaultProvider('goerli');
    // looks like angular is not a big fan of dotenv?
    // this.provider = ethers.providers.getDefaultProvider(
    //   process.env['NETWORK'],
    //   {
    //     alchemy: process.env['ALCHEMY_API_KEY'],
    //   }
    // );
  }

  syncBlock() {
    this.blockNumber = 'loading ...';
    this.provider.getBlock('latest').then((block) => {
      this.blockNumber = block.number;
    });
    this.http
      .get<{ result: string }>(this.TOKEN_ADDRESS_API_URL)
      .subscribe((answer) => {
        this.tokenContractAddress = answer.result;
        this.getTokenInfo();
      });
  }
  getTokenInfo() {
    if (!this.tokenContractAddress) return;
    this.tokenContract = new Contract(
      this.tokenContractAddress,
      tokenJson.abi,
      this.userWallet ?? this.provider
    );
    this.tokenContract['totalSupply']().then((totalSupplyBN: BigNumber) => {
      const totalSupplyStr = utils.formatEther(totalSupplyBN);
      this.tokenSupply = parseFloat(totalSupplyStr);
    });
  }
  clearBlock() {
    this.blockNumber = undefined;
  }
  createWallet() {
    this.userWallet = Wallet.createRandom().connect(this.provider);
    this.userWallet.getBalance().then((balanceBN: BigNumber) => {
      const balanceStr = utils.formatEther(balanceBN);
      this.userBalance = parseFloat(balanceStr);
      this.tokenContract?.['balanceOf'](this.userWallet?.address).then(
        (tokenBalanceBN: BigNumber) => {
          const tokenBalanceStr = utils.formatEther(tokenBalanceBN);
          this.userTokenBalance = parseFloat(tokenBalanceStr);
        }
      );
    });
  }
  async disconnect() {
    if (window.ethereum.isConnected()) {
      return window.ethereum.disconnect();
    }
  }
  async connectWallet() {
    const isMetaMaskInstalled = () => {
      const { ethereum } = window;
      return Boolean(ethereum && ethereum.isMetaMask);
    };

    const onboardButton = document.getElementById('connectButton');
    if (!isMetaMaskInstalled) {
      alert('Plase install Metamask to use app');
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      this.provider = provider;
      try {
        await provider.send('eth_requestAccounts', []);
      } catch (error) {
        console.error(error);
      }
      const signer = provider.getSigner();
      this.signer = signer;
      this.userAddress = await signer.getAddress();
      console.log(this.userAddress);
      const balanceBN = await signer.getBalance();
      const balanceStr = ethers.utils.formatEther(balanceBN);
      const balance = parseFloat(balanceStr);
      this.userBalance = balance;
      this.isWalletConnected = true;
      this.userTokenBalance =
        (await this.tokenContract?.['balanceOf']?.(this.userAddress)).then(
          (bal: BigNumber) => {
            return parseFloat(ethers.utils.formatEther(bal));
          }
        ) || 'failed to get balance';
    }
  }
  requestTokens(amount: string) {
    const body = {
      amount: amount,
      address: this.userWallet?.address,
    };
    this.http
      .post<{ result: any }>(this.TOKEN_MINT_API_URL, body)
      .subscribe((answer) => {
        console.log(answer);
      });
  }
  getVotingPower(address: string) {
    const body = {
      address: this.userWallet?.address,
    };
    this.http
      .post<{ result: any }>(this.VOTING_POWER_API_URL, body)
      .subscribe((answer) => {
        console.log(answer);
      });
  }
}
