'use client';
import { useState, useEffect } from 'react';
import { useBettingStore } from '@/store/bettingStore';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId?: string;
}

export function SettlementModal({ isOpen, onClose, channelId }: SettlementModalProps) {
  const [step, setStep] = useState<'calculating' | 'complete'>('calculating');
  const [winnings, setWinnings] = useState(0);
  const [losses, setLosses] = useState(0);

  const { settleUserBets, balance } = useBettingStore();

  // Calculate settlement when modal opens
  useEffect(() => {
    if (isOpen) {
      handleCalculate();
    } else {
      // Reset state when modal closes
      setStep('calculating');
      setWinnings(0);
      setLosses(0);
    }
  }, [isOpen]);

  const handleCalculate = async () => {
    try {
      setStep('calculating');
      
      // Calculate winnings
      console.log('📊 Calculating settlement...');
      const { totalWinnings, totalLosses } = settleUserBets();
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWinnings(totalWinnings);
      setLosses(totalLosses);
      setStep('complete');
      
      console.log('✅ Settlement calculated');
      console.log('   Total Winnings:', totalWinnings);
      console.log('   Total Losses:', totalLosses);
      console.log('   Net:', totalWinnings - totalLosses);
    } catch (err) {
      console.error('❌ Settlement calculation failed:', err);
    }
  };

  if (!isOpen) return null;

  const netProfit = winnings - losses;
  const isProfit = netProfit > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/10">
        {step === 'calculating' && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Calculating Settlement
              </h2>
              <p className="text-white/60">
                Analyzing your bets and winnings...
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {isProfit ? '🎉' : '📊'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Session Summary
              </h2>
              <p className="text-white/60 mb-6">
                State channel settled on-chain
              </p>

              {/* Net Profit/Loss */}
              <div className={`rounded-xl p-6 mb-4 border-2 ${
                isProfit 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : netProfit === 0
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <p className={`text-sm mb-2 ${
                  isProfit ? 'text-green-300' : netProfit === 0 ? 'text-blue-300' : 'text-red-300'
                }`}>
                  {isProfit ? 'Net Profit' : netProfit === 0 ? 'Break Even' : 'Net Loss'}
                </p>
                <p className={`text-4xl font-bold ${
                  isProfit ? 'text-green-400' : netProfit === 0 ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {isProfit ? '+' : ''}{netProfit.toFixed(2)} USDC
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Total Winnings</p>
                  <p className="text-xl font-bold text-green-400">
                    +{winnings.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Total Losses</p>
                  <p className="text-xl font-bold text-red-400">
                    -{losses.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Current Balance */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <p className="text-xs text-white/60 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-white">
                  {balance.total.toFixed(2)} USDC
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Available: {balance.available.toFixed(2)} | Locked: {balance.locked.toFixed(2)}
                </p>
              </div>

              {/* Channel Info */}
              {channelId && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-xs mb-1">
                    <strong>State Channel ID</strong>
                  </p>
                  <p className="font-mono text-xs text-yellow-200">
                    {channelId.substring(0, 10)}...{channelId.substring(channelId.length - 8)}
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-blue-200 text-xs">
                  💡 All bets were settled off-chain instantly with zero gas fees. 
                  Only channel open/close required on-chain transactions.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold shadow-lg"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
