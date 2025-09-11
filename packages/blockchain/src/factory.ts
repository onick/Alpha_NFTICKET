import { BlockchainProvider, BlockchainNetwork } from './types';
import { PolygonProvider } from './providers/polygon';
import { SolanaAdapter } from './adapters/solana';

interface BlockchainConfig {
  network: BlockchainNetwork;
  rpcUrl: string;
  contractAddress: string;
  privateKey?: string;
}

export class BlockchainFactory {
  static createProvider(config: BlockchainConfig): BlockchainProvider {
    switch (config.network) {
      case 'polygon':
      case 'mumbai':
        return new PolygonProvider(
          config.rpcUrl,
          config.contractAddress,
          config.privateKey
        );
      
      case 'solana':
        return new SolanaAdapter(config.rpcUrl, config.contractAddress);
      
      default:
        throw new Error(`Unsupported blockchain network: ${config.network}`);
    }
  }

  static getDefaultConfig(network: BlockchainNetwork): Partial<BlockchainConfig> {
    const configs: Record<BlockchainNetwork, Partial<BlockchainConfig>> = {
      polygon: {
        rpcUrl: 'https://polygon-rpc.com',
        contractAddress: '0x0000000000000000000000000000000000000000'
      },
      mumbai: {
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        contractAddress: '0x0000000000000000000000000000000000000000'
      },
      solana: {
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        contractAddress: 'So11111111111111111111111111111111111111112'
      },
      ethereum: {
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        contractAddress: '0x0000000000000000000000000000000000000000'
      }
    };

    return configs[network];
  }
}