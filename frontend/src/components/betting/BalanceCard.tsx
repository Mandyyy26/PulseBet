'use client';
import { useBettingStore } from '@/store/bettingStore';

export function BalanceCard() {
  const { balance, initialDeposit } = useBettingStore();

  const profitLoss = balance.total - initialDeposit;
  const profitLossPercent = initialDeposit > 0 ? (profitLoss / initialDeposit) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold opacity-90">Your Balance</h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">Testnet USDC</span>
      </div>
      
      <div className="space-y-4">
        {/* Total Balance */}
        <div>
          <p className="text-sm opacity-75 mb-1">Total Balance</p>
          <p className="text-4xl font-bold">${balance.total.toFixed(2)}</p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-75 mb-1">Available</p>
            <p className="text-xl font-semibold">${balance.available.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs opacity-75 mb-1">In Bets</p>
            <p className="text-xl font-semibold">${balance.locked.toFixed(2)}</p>
          </div>
        </div>

        {/* Profit/Loss */}
        {initialDeposit > 0 && (
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-75">Profit/Loss</p>
              <div className="text-right">
                <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USDC
                </p>
                <p className={`text-xs ${profitLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial Deposit Info */}
        {initialDeposit > 0 && (
          <div className="text-xs opacity-60 text-center pt-2">
            Initial deposit: ${initialDeposit.toFixed(2)} USDC
          </div>
        )}
      </div>
    </div>
  );
}
