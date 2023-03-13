import { Component } from '@angular/core';
import { BigNumber, Contract, Wallet, ethers, utils } from 'ethers';
import { HttpClient } from '@angular/common/http';
import tokenJson from '../assets/MyToken.json';
import ballotJson from '../assets/Ballot.json';

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
  ballotContractAddress: string | undefined;
  ballotContract: ethers.Contract | undefined;
  tokenSupply: number | undefined;
  winningProposalInfo: number | undefined;
  chainID: string | undefined;

  TOKEN_ADDRESS_API_URL = 'http://localhost:3000/contract-address';
  BALLOT_ADDRESS_API_URL = 'http://localhost:3000/ballot-contract';
  TOKEN_MINT_API_URL = 'http://localhost:3000/request-tokens';
  VOTING_POWER_API_URL = 'http://localhost:3000/voting-power';
  TOTAL_SUPPLY_API_URL = 'http://localhost:3000/total-supply';

  constructor(private http: HttpClient) {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.syncBlock();
    this.getTokenContract();
    this.getBallotContractAddress();
    this.getEthBalance();
    this.getTokenContract();
    this.getBallotContract();
    this.getTokenBalanceOf();
    this.getTotalSupply();
    this.getChainID();
  }

  async getChainID() {
    await window.ethereum
      .request({ method: 'eth_chainId' })
      .then((ans: any) => {
        const hexID = ans;
        this.chainID = hexID;
      });
  }
  async syncBlock() {
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
  async getTokenContractAddress() {
    this.http
      .get<{ result: string }>(this.TOKEN_ADDRESS_API_URL)
      .subscribe((answer) => {
        this.tokenContractAddress = answer.result;
        this.getTokenInfo();
      });
  }
  async getBallotContractAddress() {
    this.http
      .get<{ result: string }>(this.BALLOT_ADDRESS_API_URL)
      .subscribe((answer) => {
        this.ballotContractAddress = answer.result;
        this.getTokenInfo();
      });
  }
  async getBallotContract() {
    if (!this.ballotContractAddress) {
      return;
    } else {
      this.ballotContract = new Contract(
        this.ballotContractAddress,
        ballotJson.abi,
        this.provider
      );
    }
  }
  async getTokenContract() {
    if (!this.tokenContractAddress) {
      return;
    } else {
      this.tokenContract = new Contract(
        this.tokenContractAddress,
        tokenJson.abi,
        this.provider
      );
    }
  }
  async getTokenBalanceOf() {
    if (!this.tokenContract) return;
    this.tokenContract?.['balanceOf']?.(this.userAddress).then(
      (bal: BigNumber) => {
        const balStr = utils.formatEther(bal);
        this.userTokenBalance = parseFloat(balStr);
      }
    );
  }

  async getEthBalance() {
    if (!this.signer) {
      return;
    } else {
      const balanceBN = await this.signer?.getBalance();
      const balanceStr = ethers.utils.formatEther(balanceBN);
      const balance = parseFloat(balanceStr);
      this.userBalance = balance;
    }
  }

  async getTotalSupply() {
    this.http
      .get<{ result: number }>(this.TOTAL_SUPPLY_API_URL)
      .subscribe((answer) => {
        this.tokenSupply = answer.result;
      });
  }

  async getTokenInfo() {
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
      this.getEthBalance();
    }
  }

  async requestTokens(amount: string) {
    const body = {
      amount: amount,
      address: this.userWallet?.address,
    };
    // this.http
    //   .post<{ result: any }>(this.TOKEN_MINT_API_URL, body)
    //   .subscribe((answer) => {
    //     console.log(answer);
    //   });
    await this.tokenContract?.['mint'].connect(this.provider);
  }
  async getVotingPower(address: string) {
    const body = {
      address: this.userWallet?.address,
    };
    this.http
      .post<{ result: any }>(this.VOTING_POWER_API_URL, body)
      .subscribe((answer) => {
        console.log(answer);
      });
  }
  async getWinningProposal() {}
  async delegate(value: string) {}
  async vote(proposal: string, value: string) {}
}
