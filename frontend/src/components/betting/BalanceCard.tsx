'use client';
import { useBettingStore } from '@/store/bettingStore';

export function BalanceCard() {
  const { balance } = useBettingStore();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium opacity-90">Session Active</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs opacity-75 mb-1">Available</p>
          <p className="text-2xl font-bold">${balance.available.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-1">In Bets</p>
          <p className="text-2xl font-bold">${balance.locked.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs opacity-75 mb-1">Total</p>
          <p className="text-2xl font-bold">${balance.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs opacity-60">Powered by Yellow Network ⚡ Gasless Betting</p>
      </div>
    </div>
  );
}
