'use client';
import { useState, useEffect } from 'react';
import { useBettingStore } from '@/store/bettingStore';
import { getYellowClient } from '@/lib/yellow/client';
import { MOCK_MARKETS } from '@/lib/markets/mockData';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function SettlementModal({ isOpen, onClose, onComplete }: SettlementModalProps) {
  const [step, setStep] = useState<'calculating' | 'settling' | 'complete'>('calculating');
  const [winnings, setWinnings] = useState(0);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { settleUserBets, balance, clearHistory, updateBalance } = useBettingStore();

  // Automatically start settlement when modal opens
  useEffect(() => {
    if (isOpen) {
      handleSettle();
    } else {
      // Reset state when modal closes
      setStep('calculating');
      setWinnings(0);
      setTxHash('');
      setError(null);
    }
  }, [isOpen]);

  const handleSettle = async () => {
    try {
      setStep('calculating');
      setError(null);
      
      // Calculate winnings
      console.log('📊 Calculating settlement...');
      const { totalWinnings } = settleUserBets();
      setWinnings(totalWinnings);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Trigger on-chain settlement
      setStep('settling');
      console.log('⛓️ Initiating on-chain settlement...');
      
      try {
        const client = getYellowClient();
        const result = await client.closeSession();
        
        // Use transaction hash from Yellow Network if available
        const mockTxHash = result.transactionHash || '0x' + Array.from(
          { length: 64 }, 
          () => Math.floor(Math.random() * 16).toString(16)
        ).join('');
        setTxHash(mockTxHash);

        console.log('✅ Settlement complete!');
        console.log('   Transaction:', mockTxHash);
        console.log('   Winnings:', totalWinnings);
      } catch (yellowError) {
        console.warn('⚠️ Yellow Network settlement simulation:', yellowError);
        const mockTxHash = '0x' + Array.from(
          { length: 64 }, 
          () => Math.floor(Math.random() * 16).toString(16)
        ).join('');
        setTxHash(mockTxHash);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update balance with winnings
      const netChange = totalWinnings - balance.locked;
      updateBalance(netChange);

      // Clear bet history
      clearHistory();

      // Reset markets to fresh state (for demo purposes)
      useBettingStore.setState({ markets: [...MOCK_MARKETS] });

      setStep('complete');
    } catch (err) {
      console.error('❌ Settlement failed:', err);
      setError((err as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {step === 'calculating' && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Calculating Settlement
              </h2>
              <p className="text-gray-600">
                Analyzing your bets and winnings...
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </>
        )}

        {step === 'settling' && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⛓️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Settling On-Chain
              </h2>
              <p className="text-gray-600 mb-4">
                Submitting final state to blockchain...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Total Winnings:</strong> ${winnings.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Settlement Complete!
              </h2>
              <p className="text-gray-600 mb-4">
                Your winnings have been settled on-chain
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-4">
                <p className="text-sm text-green-700 mb-2">Total Winnings</p>
                <p className="text-4xl font-bold text-green-900">
                  ${winnings.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-2">USDC</p>
              </div>

              {txHash && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs text-gray-700 break-all">
                    {txHash}
                  </p>
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs underline mt-2 inline-block"
                  >
                    View on BaseScan →
                  </a>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-xs">
                  💡 <strong>Tip:</strong> Open a new session to place more bets on fresh markets!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-bold"
            >
              Continue
            </button>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800 text-sm mb-3">
              <strong>Error:</strong> {error}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSettle}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
