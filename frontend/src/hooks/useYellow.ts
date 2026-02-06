'use client';
import { useState, useRef } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { 
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
  createCreateChannelMessage,
  createResizeChannelMessage,
  createCloseChannelMessage,
} from '@erc7824/nitrolite';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import type { Address } from 'viem';
import { YellowNetworkClient } from '@/lib/yellow/client';

export function useYellow() {
  const { address, isConnected: isWalletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<number>(0);
  
  const yellowClient = useRef<YellowNetworkClient | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const sessionSigner = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openSession = async (depositAmount: number) => {
    if (!walletClient || !publicClient || !address) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    // Set overall timeout (60 seconds)
    timeoutRef.current = setTimeout(() => {
      setError('Connection timeout. Please try again.');
      setLoading(false);
      ws.current?.close();
    }, 60000);

    try {
      console.log('🟡 Opening Yellow Network session...');
      console.log('   Amount:', depositAmount, 'USDC');
      console.log('   Address:', address);

      // 1. Initialize Yellow Client
      yellowClient.current = new YellowNetworkClient(walletClient, publicClient);
      await yellowClient.current.initialize();

      // 2. Connect WebSocket
      ws.current = await yellowClient.current.connectWebSocket();

      // 3. Generate session key
      const sessionPrivateKey = generatePrivateKey();
      sessionSigner.current = createECDSAMessageSigner(sessionPrivateKey);
      const sessionAccount = privateKeyToAccount(sessionPrivateKey);

      console.log('🔑 Session key generated:', sessionAccount.address);

      // 4. Authenticate
      const authParams = {
        session_key: sessionAccount.address,
        allowances: [
          { 
            asset: 'ytest.usd', 
            amount: (depositAmount * 1_000_000).toString()
          }
        ],
        expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
        scope: 'pulsebet.app',
      };

      const authRequestMsg = await createAuthRequestMessage({
        address: address,
        application: 'PulseBet',
        ...authParams,
      });

      // Handle WebSocket close/error
      ws.current.onclose = (event) => {
        console.error('❌ WebSocket closed:', event.code, event.reason);
        if (loading) {
          setError('Connection lost. Please try again.');
          setLoading(false);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (loading) {
          setError('WebSocket connection error. Please check your network.');
          setLoading(false);
        }
      };

      // Set up message handler
      ws.current.onmessage = async (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('📨 Received:', response);

          if (response.error) {
            setError(response.error.message || 'Unknown error from Yellow Network');
            setLoading(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
          }

          // Handle auth challenge
          if (response.res && response.res[1] === 'auth_challenge') {
            console.log('🔐 Authenticating with wallet signature...');
            const challenge = response.res[2].challenge_message;
            
            try {
              const signer = createEIP712AuthMessageSigner(
                walletClient,
                authParams,
                { name: 'PulseBet' }
              );
              
              const verifyMsg = await createAuthVerifyMessageFromChallenge(signer, challenge);
              
              // Make sure WebSocket is still open
              if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(verifyMsg);
              } else {
                throw new Error('WebSocket disconnected during authentication');
              }
            } catch (err: any) {
              console.error('❌ Authentication failed:', err);
              setError(err.message || 'Failed to authenticate');
              setLoading(false);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              return;
            }
          }

          // Handle auth success
          if (response.res && response.res[1] === 'auth_verify') {
            console.log('✅ Authenticated!');
            console.log('📦 Creating state channel...');
            
            try {
              const createChannelMsg = await createCreateChannelMessage(
                sessionSigner.current,
                {
                  chain_id: 11155111,
                  token: (process.env.NEXT_PUBLIC_YTEST_USD || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238') as Address,
                }
              );
              
              // Make sure WebSocket is still open
              if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(createChannelMsg);
              } else {
                throw new Error('WebSocket disconnected after authentication');
              }
            } catch (err: any) {
              console.error('❌ Channel creation request failed:', err);
              setError(err.message || 'Failed to request channel creation');
              setLoading(false);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              return;
            }
          }

          // Handle channel creation
          if (response.res && response.res[1] === 'create_channel') {
            const { channel_id, channel, state, server_signature } = response.res[2];
            console.log('📦 Channel created:', channel_id);
            
            setChannelId(channel_id as `0x${string}`);
            
            const client = yellowClient.current?.getClient();
            if (client) {
              try {
                const unsignedInitialState = {
                  intent: state.intent,
                  version: BigInt(state.version),
                  data: state.state_data,
                  allocations: state.allocations.map((a: any) => ({
                    destination: a.destination as Address,
                    token: a.token as Address,
                    amount: BigInt(a.amount),
                  })),
                };

                console.log('⛓️  Submitting channel to blockchain...');
                const result = await client.createChannel({
                  channel,
                  unsignedInitialState,
                  serverSignature: server_signature,
                });
                
                const txHash = typeof result === 'string' ? result : result.txHash;
                console.log('⛓️  Channel created on-chain:', txHash);
                
                console.log('⏳ Waiting for confirmation...');
                await publicClient.waitForTransactionReceipt({ hash: txHash as Address });
                
                console.log('💰 Funding channel...');
                const resizeMsg = await createResizeChannelMessage(
                  sessionSigner.current,
                  {
                    channel_id: channel_id,
                    allocate_amount: BigInt(depositAmount),
                    funds_destination: address,
                  }
                );
                
                if (ws.current?.readyState === WebSocket.OPEN) {
                  ws.current.send(resizeMsg);
                } else {
                  throw new Error('WebSocket disconnected during channel funding');
                }
              } catch (err: any) {
                console.error('❌ Blockchain submission failed:', err);
                setError(err.message || 'Failed to create channel on blockchain');
                setLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                return;
              }
            }
          }

          // Handle channel resize
          if (response.res && response.res[1] === 'resize_channel') {
            const { channel_id, state, server_signature } = response.res[2];
            console.log('💰 Channel resize confirmed, funding...');
            
            const client = yellowClient.current?.getClient();
            if (client) {
              try {
                const resizeState = {
                  intent: state.intent,
                  version: BigInt(state.version),
                  data: state.state_data,
                  allocations: state.allocations.map((a: any) => ({
                    destination: a.destination as Address,
                    token: a.token as Address,
                    amount: BigInt(a.amount),
                  })),
                  channelId: channel_id,
                  serverSignature: server_signature,
                };

                console.log('⛓️  Submitting funding to blockchain...');
                const { txHash } = await client.resizeChannel({
                  resizeState,
                  proofStates: [],
                });
                
                console.log('⛓️  Channel funded on-chain:', txHash);
                console.log('⏳ Waiting for confirmation...');
                await publicClient.waitForTransactionReceipt({ hash: txHash as Address });
                
                setBalance(depositAmount);
                setConnected(true);
                setLoading(false);
                
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                
                console.log('✅ Session opened successfully!');
                console.log('   Channel ID:', channel_id);
                console.log('   Balance:', depositAmount, 'USDC');
              } catch (err: any) {
                console.error('❌ Funding failed:', err);
                setError(err.message || 'Failed to fund channel');
                setLoading(false);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                return;
              }
            }
          }
        } catch (err: any) {
          console.error('❌ Error handling message:', err);
          setError(err.message || 'Failed to process message');
          setLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      };

      // Send auth request
      console.log('📤 Sending authentication request...');
      ws.current.send(authRequestMsg);
      
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to open session');
      setConnected(false);
      setLoading(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const closeSession = async () => {
    if (!ws.current || !sessionSigner.current || !channelId) {
      setError('No active session');
      return;
    }

    setLoading(true);
    try {
      console.log('🔒 Closing session...');
      
      const closeMsg = await createCloseChannelMessage(
        sessionSigner.current,
        channelId,
        address as Address
      );
      
      ws.current.send(closeMsg);
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Close timeout'));
        }, 10000);

        const handler = (event: MessageEvent) => {
          try {
            const response = JSON.parse(event.data);
            if (response.res && response.res[1] === 'close_channel') {
              clearTimeout(timeout);
              resolve();
            }
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        };
        
        ws.current?.addEventListener('message', handler, { once: true });
      });

      console.log('✅ Session closed');
      setConnected(false);
      setChannelId(null);
      setBalance(0);
      yellowClient.current?.disconnect();
      
    } catch (err: any) {
      console.error('❌ Error closing session:', err);
      setError(err.message || 'Failed to close session');
    } finally {
      setLoading(false);
    }
  };

  return {
    connected,
    loading,
    error,
    isWalletConnected,
    address,
    balance,
    channelId,
    openSession,
    closeSession,
  };
}
