export class RequestTokensDTO {
  address: string;
  amount: string;
}

export class TransactionResponseDTO {
  message: string;
  transactionHash: string;
  etherscan: string;
}

export class TransactionErrorDTO {
  message: string;
  details: any;
}

export class VotingPowerDTO {
  address: string;
}
