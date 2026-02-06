import { NitroliteClient, WalletStateSigner } from '@erc7824/nitrolite';
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain,
  type Transport,
  type Account
} from 'viem';
import { sepolia } from 'viem/chains';

export class YellowNetworkClient {
  private client: NitroliteClient | null = null;
  private ws: WebSocket | null = null;
  
  constructor(
    private walletClient: WalletClient<Transport, Chain, Account>,
    private publicClient: PublicClient<Transport, Chain>
  ) {}

  async initialize() {
    console.log('🟡 Initializing Yellow Network Client...');
    
    try {
      this.client = new NitroliteClient({
        publicClient: this.publicClient as any, // Type assertion for compatibility
        walletClient: this.walletClient as any, // Type assertion for compatibility
        stateSigner: new WalletStateSigner(this.walletClient as any),
        addresses: {
          custody: process.env.NEXT_PUBLIC_CUSTODY_CONTRACT as Address,
          adjudicator: process.env.NEXT_PUBLIC_ADJUDICATOR_CONTRACT as Address,
        },
        chainId: sepolia.id,
        challengeDuration: BigInt(3600), // 1 hour - using BigInt() instead of 3600n
      });

      console.log('✅ Yellow Network Client initialized');
      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      throw error;
    }
  }

  connectWebSocket(): Promise<WebSocket> {
    const wsUrl = process.env.NEXT_PUBLIC_YELLOW_WS || 'wss://clearnet-sandbox.yellow.com/ws';
    
    return new Promise<WebSocket>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('✅ Connected to Yellow Network');
          resolve(this.ws!);
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  getWebSocket() {
    return this.ws;
  }

  getClient() {
    return this.client;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.client = null;
  }
}
