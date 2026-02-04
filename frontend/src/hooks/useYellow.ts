'use client';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getYellowClient } from '@/lib/yellow/client';

export function useYellow() {
  const { address, isConnected: isWalletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual connect function - called when user clicks "Open Session"
  const openSession = async () => {
    if (!isWalletConnected || !address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getYellowClient();
      await client.connect(address, walletClient);
      
      setConnected(true);
      setBalance('100.00'); // TODO: Query real balance from Yellow
      console.log('✅ Yellow session opened successfully');
    } catch (err) {
      setError((err as Error).message);
      setConnected(false);
      console.error('❌ Failed to open Yellow session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manual disconnect function
  const closeSession = () => {
    const client = getYellowClient();
    client.disconnect();
    setConnected(false);
    setBalance('0');
    console.log('🔌 Yellow session closed');
  };

  return { 
    connected, 
    balance, 
    loading, 
    error,
    walletAddress: address,
    isWalletConnected,
    openSession,
    closeSession
  };
}
