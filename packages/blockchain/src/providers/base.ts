import { BlockchainProvider, MintTicketParams, TicketNFT, TransactionStatus, BlockchainNetwork } from '../types';

export abstract class BaseBlockchainProvider implements BlockchainProvider {
  protected network: BlockchainNetwork;
  protected rpcUrl: string;
  protected contractAddress: string;

  constructor(network: BlockchainNetwork, rpcUrl: string, contractAddress: string) {
    this.network = network;
    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
  }

  abstract mintTicket(params: MintTicketParams): Promise<{
    tokenId: string;
    txHash: string;
  }>;

  abstract verifyTicket(tokenId: string): Promise<{
    isValid: boolean;
    ticket?: TicketNFT;
  }>;

  abstract getTxStatus(txId: string): Promise<TransactionStatus>;

  getNetwork(): BlockchainNetwork {
    return this.network;
  }

  protected generateTokenId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}