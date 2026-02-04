'use client';
import { useBettingStore } from '@/store/bettingStore';

export function BetHistory() {
  const { getUserBets, getMarketById } = useBettingStore();
  const bets = getUserBets();

  if (bets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-400">
        <div className="text-5xl mb-3">📊</div>
        <p className="font-medium">No bets yet</p>
        <p className="text-sm mt-1">Place your first bet to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Recent Bets</h3>
      <div className="space-y-3">
        {bets.slice().reverse().map((bet) => {
          const market = getMarketById(bet.marketId);
          return (
            <div
              key={bet.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {market?.question || bet.marketId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {bet.timestamp.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bet.outcome === 'YES'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {bet.outcome}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Amount: <strong className="text-gray-900">${bet.amount.toFixed(2)}</strong>
                </span>
                <span className="text-gray-600">
                  Potential: <strong className="text-blue-600">${bet.potentialPayout.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
