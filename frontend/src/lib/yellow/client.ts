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
  private sessionId: string | null = null;
  private pendingRequests: Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();

  constructor(private endpoint: string) {
    console.log('🏗️ YellowClient initialized with endpoint:', endpoint);
  }

  async connect(walletAddress: string, walletClient: WalletClient): Promise<void> {
    console.log('🔗 [STEP 1] Starting connection...');
    console.log('   Wallet Address:', walletAddress);
    console.log('   Endpoint:', this.endpoint);
    
    this.walletAddress = walletAddress;
    this.walletClient = walletClient;
    
    return new Promise((resolve, reject) => {
      console.log('🔌 [STEP 2] Opening WebSocket...');
      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        console.log('✅ [STEP 3] WebSocket connected!');
        console.log('   ReadyState:', this.ws?.readyState);
        console.log('   URL:', this.ws?.url);
        this.authenticate();
        resolve();
      };

      this.ws.onmessage = (event) => {
        console.log('📨 [MESSAGE RECEIVED]', event.data);
        const message = parseAnyRPCResponse(event.data);
        console.log('📦 [PARSED MESSAGE]', message);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('❌ [ERROR] WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 [CLOSED] WebSocket disconnected');
        console.log('   Code:', event.code);
        console.log('   Reason:', event.reason);
        console.log('   Clean:', event.wasClean);
        this.isAuthenticated = false;
      };
    });
  }

  private async authenticate() {
    console.log('🔐 [STEP 4] Starting authentication...');
    
    if (!this.walletClient) {
      console.error('❌ No wallet client available');
      return;
    }

    // Generate session key
    const sessionKeyPair = this.generateSessionKey();
    this.sessionKey = sessionKeyPair.address;
    console.log('🔑 [STEP 5] Session key generated:');
    console.log('   Address:', sessionKeyPair.address);

    // Create message signer
    const messageSigner = async (payload: RPCData): Promise<`0x${string}`> => {
      try {
        console.log('📝 [STEP 6] Requesting signature from wallet...');
        console.log('   Payload:', payload);
        
        const signature = await this.walletClient!.signMessage({
          account: this.walletAddress as `0x${string}`,
          message: JSON.stringify(payload),
        });
        
        console.log('✅ [STEP 7] Signature received:');
        console.log('   Signature:', signature);
        console.log('   Length:', signature.length);
        return signature;
      } catch (error) {
        console.error('❌ [ERROR] Signing failed:', error);
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

    console.log('📋 [STEP 8] Session parameters:', params);

    try {
      console.log('🔨 [STEP 9] Creating app session message...');
      const sessionMessage = await createAppSessionMessage(
        messageSigner,
        params as any
      );
      
      console.log('📤 [STEP 10] Sending session message:', sessionMessage);
      this.send(sessionMessage);
    } catch (error) {
      console.error('❌ [ERROR] Authentication failed:', error);
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
    console.log('🎯 [STEP 11] Handling message...');

    // Handle app session created
    if (message.res && message.res[1] === 'create_app_session') {
      this.isAuthenticated = true;
      this.sessionId = message.res[2]?.app_session_id;
      console.log('🎉 [SUCCESS] App session created!');
      console.log('   Session ID:', this.sessionId);
      console.log('   Status:', message.res[2]?.status);
      console.log('   Full Response:', message.res[2]);
      this.flushQueue();
      return;
    }

    // Handle bet responses
    if (message.res && message.res[1] === 'update_state') {
      const requestId = message.res[0];
      const callback = this.pendingRequests.get(requestId);
      if (callback) {
        console.log('✅ [BET CONFIRMED] Bet placed successfully');
        callback.resolve(message.res[2]);
        this.pendingRequests.delete(requestId);
      }
      return;
    }

    // Handle balance responses
    if (message.res && message.res[1] === 'query_balance') {
      const requestId = message.res[0];
      const callback = this.pendingRequests.get(requestId);
      if (callback) {
        const balance = parseFloat(message.res[2]?.balance || '0');
        console.log('💰 [BALANCE RECEIVED]', balance);
        callback.resolve(balance);
        this.pendingRequests.delete(requestId);
      }
      return;
    }

    // Handle close session responses
    if (message.res && message.res[1] === 'close_session') {
      const requestId = message.res[0];
      const callback = this.pendingRequests.get(requestId);
      if (callback) {
        console.log('🔒 [SESSION CLOSED] Settlement complete');
        callback.resolve(message.res[2]);
        this.pendingRequests.delete(requestId);
      }
      return;
    }

    // Handle errors
    if (message.err) {
      console.error('❌ [ERROR] Yellow Network error:', message.err);
      // Reject any pending requests
      const requestId = message.err[0];
      const callback = this.pendingRequests.get(requestId);
      if (callback) {
        callback.reject(new Error(message.err[2]?.message || 'Unknown error'));
        this.pendingRequests.delete(requestId);
      }
    }
  }

  /**
   * Place a bet via Yellow Network state channel
   */
  async placeBet(marketId: string, outcome: 'YES' | 'NO', amount: number): Promise<string> {
    if (!this.isAuthenticated) {
      throw new Error('Session not authenticated');
    }

    const betId = `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Construct bet message for Yellow Network
    const betMessage = {
      req: [
        Date.now(),
        'update_state',
        {
          session_id: this.sessionId,
          action: 'place_bet',
          params: {
            bet_id: betId,
            market_id: marketId,
            outcome,
            amount: amount.toString(),
            timestamp: Date.now(),
          }
        }
      ]
    };

    console.log('🎲 [PLACING BET] Sending to Yellow Network:', betMessage);
    
    return new Promise((resolve, reject) => {
      // Store callback for response
      const requestId = betMessage.req[0];
      this.pendingRequests.set(requestId as number, { resolve, reject });

      // Send bet message
      this.send(betMessage);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId as number)) {
          this.pendingRequests.delete(requestId as number);
          reject(new Error('Bet timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Get current balance from Yellow Network
   */
  async getBalance(): Promise<number> {
    if (!this.isAuthenticated) {
      throw new Error('Session not authenticated');
    }

    const balanceMessage = {
      req: [
        Date.now(),
        'query_balance',
        {
          session_id: this.sessionId,
          participant: this.walletAddress,
        }
      ]
    };

    console.log('💰 [QUERY BALANCE] Requesting from Yellow Network');
    
    return new Promise((resolve, reject) => {
      const requestId = balanceMessage.req[0];
      this.pendingRequests.set(requestId as number, { resolve, reject });

      this.send(balanceMessage);

      setTimeout(() => {
        if (this.pendingRequests.has(requestId as number)) {
          this.pendingRequests.delete(requestId as number);
          reject(new Error('Balance query timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Close session and trigger settlement
   */
  async closeSession(): Promise<{ finalBalance: number; transactionHash?: string }> {
    if (!this.isAuthenticated) {
      throw new Error('Session not authenticated');
    }

    console.log('🔒 [CLOSING SESSION] Initiating settlement...');

    const closeMessage = {
      req: [
        Date.now(),
        'close_session',
        {
          session_id: this.sessionId,
          final_state: true,
        }
      ]
    };

    return new Promise((resolve, reject) => {
      const requestId = closeMessage.req[0];
      this.pendingRequests.set(requestId as number, { resolve, reject });

      this.send(closeMessage);

      setTimeout(() => {
        if (this.pendingRequests.has(requestId as number)) {
          this.pendingRequests.delete(requestId as number);
          reject(new Error('Close session timeout'));
        }
      }, 30000); // 30 second timeout for settlement
    });
  }

  send(message: any) {
    const canSend = this.isAuthenticated || message.req?.[1]?.includes('create_app_session');
    
    if (!canSend) {
      console.log('⏸️ [QUEUED] Message queued (not authenticated yet):', message);
      this.messageQueue.push(message);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('📤 [SENDING] Message:', message);
      this.ws.send(JSON.stringify(message));
      console.log('✅ [SENT] Message sent successfully');
    } else {
      console.error('❌ [ERROR] WebSocket not ready. State:', this.ws?.readyState);
    }
  }

  private flushQueue() {
    if (this.messageQueue.length > 0) {
      console.log('📦 [FLUSHING] Processing queued messages:', this.messageQueue.length);
      this.messageQueue.forEach((msg) => this.send(msg));
      this.messageQueue = [];
    } else {
      console.log('✅ [QUEUE EMPTY] No pending messages');
    }
  }

  disconnect() {
    console.log('👋 [DISCONNECTING] Closing session...');
    this.ws?.close();
    this.isAuthenticated = false;
    this.walletAddress = '';
    this.walletClient = null;
    this.sessionId = null;
    console.log('✅ [DISCONNECTED] Session closed');
  }

  // Helper methods for debugging
  getConnectionStatus() {
    return {
      wsState: this.ws?.readyState,
      wsStateString: this.getReadyStateString(),
      isAuthenticated: this.isAuthenticated,
      sessionId: this.sessionId,
      walletAddress: this.walletAddress,
      queueLength: this.messageQueue.length,
      endpoint: this.endpoint
    };
  }

  private getReadyStateString() {
    switch(this.ws?.readyState) {
      case 0: return 'CONNECTING';
      case 1: return 'OPEN';
      case 2: return 'CLOSING';
      case 3: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  isConnected(): boolean {
    return this.isAuthenticated;
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  getSessionId(): string | null {
    return this.sessionId;
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
