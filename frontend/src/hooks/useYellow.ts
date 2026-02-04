'use client';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { getYellowClient } from '@/lib/yellow/client';
import { useBettingStore } from '@/store/bettingStore';

export function useYellow() {
  const { address, isConnected: isWalletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettlement, setShowSettlement] = useState(false);

  const { initializeBalance } = useBettingStore();

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
      initializeBalance(100); // Mock $100 deposit
      console.log('✅ Yellow session opened successfully');
    } catch (err) {
      setError((err as Error).message);
      setConnected(false);
      console.error('❌ Failed to open Yellow session:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeSession = () => {
    // Show settlement modal instead of direct close
    setShowSettlement(true);
  };

  const handleSettlementComplete = () => {
    const client = getYellowClient();
    client.disconnect();
    setConnected(false);
    setShowSettlement(false);
    console.log('🔌 Yellow session closed');
  };

  return { 
    connected, 
    loading, 
    error,
    walletAddress: address,
    isWalletConnected,
    openSession,
    closeSession,
    showSettlement,
    setShowSettlement,
    handleSettlementComplete,
  };
}
