import { createAppSessionMessage, parseAnyRPCResponse } from '@erc7824/nitrolite';
import type { RPCData } from '@erc7824/nitrolite';
import type { WalletClient } from 'viem';

export class YellowClient {
  private ws: WebSocket | null = null;
  private sessionKey: string | null = null;
  private isAuthenticated = false;
  private messageQueue: any[] = [];
  private walletAddress: string = '';
  private walletClient: WalletClient | null = null;

  constructor(private endpoint: string) {}

  async connect(walletAddress: string, walletClient: WalletClient): Promise<void> {
    this.walletAddress = walletAddress;
    this.walletClient = walletClient;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        console.log('✅ Connected to Yellow Network');
        this.authenticate();
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = parseAnyRPCResponse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('❌ Yellow connection error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from Yellow');
        this.isAuthenticated = false;
      };
    });
  }

  private async authenticate() {
    if (!this.walletClient) {
      console.error('❌ No wallet client available');
      return;
    }

    // Generate session key
    const sessionKeyPair = this.generateSessionKey();
    this.sessionKey = sessionKeyPair.address;

    // Create message signer using real wallet
    const messageSigner = async (payload: RPCData): Promise<`0x${string}`> => {
      try {
        console.log('📝 Signing payload with wallet...');
        const signature = await this.walletClient!.signMessage({
          account: this.walletAddress as `0x${string}`,
          message: JSON.stringify(payload),
        });
        console.log('✅ Signature:', signature);
        return signature;
      } catch (error) {
        console.error('❌ Signing failed:', error);
        throw error;
      }
    };

    // Define app session parameters
    const params = {
      definition: {
        application: 'prediction-markets',
        protocol: 'NitroRPC/0.4',
        participants: [this.walletAddress, sessionKeyPair.address],
        weights: [1, 1],
        quorum: 1,
        challenge: 86400,
        nonce: Date.now()
      },
      allocations: [
        {
          participant: this.walletAddress,
          asset: process.env.NEXT_PUBLIC_USDC_ADDRESS!,
          amount: '0'
        },
        {
          participant: sessionKeyPair.address,
          asset: process.env.NEXT_PUBLIC_USDC_ADDRESS!,
          amount: '0'
        }
      ]
    };

    try {
      const sessionMessage = await createAppSessionMessage(
        messageSigner,
        params as any
      );
      
      this.send(sessionMessage);
    } catch (error) {
      console.error('❌ Authentication failed:', error);
    }
  }

  private generateSessionKey() {
    const privateKey = '0x' + Array.from(
      { length: 64 }, 
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const address = '0x' + Array.from(
      { length: 40 }, 
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { privateKey, address };
  }

  private handleMessage(message: any) {
    console.log('📨 Received:', message);

    if (message.res && message.res[1] === 'create_app_session') {
      this.isAuthenticated = true;
      const appSessionId = message.res[2]?.app_session_id;
      console.log('✅ App session created:', appSessionId);
      this.flushQueue();
    }

    if (message.err) {
      console.error('❌ Yellow error:', message.err);
    }
  }

  send(message: any) {
    if (!this.isAuthenticated && !message.req?.[1]?.includes('create_app_session')) {
      this.messageQueue.push(message);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private flushQueue() {
    this.messageQueue.forEach((msg) => this.send(msg));
    this.messageQueue = [];
  }

  disconnect() {
    this.ws?.close();
    this.isAuthenticated = false;
    this.walletAddress = '';
    this.walletClient = null;
  }

  isConnected(): boolean {
    return this.isAuthenticated;
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }
}

let yellowClientInstance: YellowClient | null = null;

export function getYellowClient(): YellowClient {
  if (!yellowClientInstance) {
    yellowClientInstance = new YellowClient(
      process.env.NEXT_PUBLIC_YELLOW_WS!
    );
  }
  return yellowClientInstance;
}
