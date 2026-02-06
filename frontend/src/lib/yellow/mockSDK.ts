import type { Address } from 'viem';

export class YellowClearingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YellowClearingError';
  }
}

export interface YellowSDKConfig {
  endpoint: string;
}

export interface ConnectConfig {
  signer: any;
  broker: {
    accountId: Address;
    clearingUrl: string;
  };
  tokens: Array<{
    address: Address;
    amount: bigint;
  }>;
}

export default class YellowSDK {
  private endpoint: string;
  private connected = false;
  private config: ConnectConfig | null = null;

  constructor(config: YellowSDKConfig) {
    this.endpoint = config.endpoint;
    console.log('🟡 Yellow SDK initialized (Mock Mode for Demo)');
    console.log('   Endpoint:', this.endpoint);
  }

  async connect(config: ConnectConfig): Promise<void> {
    console.log('🟡 [MOCK SDK] Connecting to Yellow Network...');
    console.log('   Account:', config.broker.accountId);
    console.log('   Clearing URL:', config.broker.clearingUrl);
    console.log('   Token:', config.tokens[0]?.address);
    console.log('   Amount:', (Number(config.tokens[0]?.amount) / 1e6).toFixed(2), 'USDC');

    // Simulate network delay (realistic)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    this.connected = true;
    this.config = config;
    
    console.log('✅ [MOCK SDK] Connected successfully!');
    console.log('   Session Status: ACTIVE');
    console.log('   Network: Testnet (Sepolia)');
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Yellow Network');
    }

    console.log('🔒 [MOCK SDK] Disconnecting from Yellow Network...');
    console.log('   Settling positions...');
    
    // Simulate settlement delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.connected = false;
    this.config = null;
    
    console.log('✅ [MOCK SDK] Disconnected successfully!');
    console.log('   All positions settled');
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConfig(): ConnectConfig | null {
    return this.config;
  }
}

export { YellowSDK };
