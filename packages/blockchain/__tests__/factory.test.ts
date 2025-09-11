import { BlockchainFactory } from '../src/factory';
import { PolygonProvider } from '../src/providers/polygon';
import { SolanaAdapter } from '../src/adapters/solana';

describe('BlockchainFactory', () => {
  describe('createProvider', () => {
    it('should create PolygonProvider for polygon network', () => {
      const config = {
        network: 'polygon' as const,
        rpcUrl: 'https://polygon-rpc.com',
        contractAddress: '0x123'
      };

      const provider = BlockchainFactory.createProvider(config);
      expect(provider).toBeInstanceOf(PolygonProvider);
      expect(provider.getNetwork()).toBe('polygon');
    });

    it('should create SolanaAdapter for solana network', () => {
      const config = {
        network: 'solana' as const,
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        contractAddress: 'So11111111111111111111111111111111111111112'
      };

      const provider = BlockchainFactory.createProvider(config);
      expect(provider).toBeInstanceOf(SolanaAdapter);
      expect(provider.getNetwork()).toBe('solana');
    });

    it('should throw error for unsupported network', () => {
      const config = {
        network: 'bitcoin' as any,
        rpcUrl: 'https://bitcoin-rpc.com',
        contractAddress: '0x123'
      };

      expect(() => BlockchainFactory.createProvider(config)).toThrow(
        'Unsupported blockchain network: bitcoin'
      );
    });
  });
});