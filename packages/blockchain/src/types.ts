export interface MintTicketParams {
  eventId: string;
  orderId: string;
  toAddress: string;
  metadata?: {
    eventName: string;
    eventDate: string;
    seatNumber?: string;
    ticketType: string;
  };
}

export interface TicketNFT {
  tokenId: string;
  contractAddress: string;
  chain: BlockchainNetwork;
  txHash: string;
  metadata: {
    eventId: string;
    orderId: string;
    eventName: string;
    eventDate: string;
    seatNumber?: string;
    ticketType: string;
  };
}

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export type BlockchainNetwork = 'polygon' | 'solana' | 'ethereum' | 'mumbai';

export interface BlockchainProvider {
  mintTicket(params: MintTicketParams): Promise<{
    tokenId: string;
    txHash: string;
  }>;
  
  verifyTicket(tokenId: string): Promise<{
    isValid: boolean;
    ticket?: TicketNFT;
  }>;
  
  getTxStatus(txId: string): Promise<TransactionStatus>;
  
  getNetwork(): BlockchainNetwork;
}