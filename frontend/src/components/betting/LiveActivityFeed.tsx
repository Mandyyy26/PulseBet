'use client';
import { useBettingStore } from '@/store/bettingStore';

export function LiveActivityFeed() {
  const bets = useBettingStore((state) => state.bets);
  const getMarketById = useBettingStore((state) => state.getMarketById);
  
  // Get last 5 bets, most recent first
  const recentBets = bets.slice(-5).reverse();

  if (recentBets.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-gray-400 font-medium mb-1">No recent activity</p>
        <p className="text-gray-500 text-sm">Place your first bet to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Your Recent Activity</span>
        <span className="ml-auto text-sm font-normal text-gray-500">
          {bets.length} total bet{bets.length !== 1 ? 's' : ''}
        </span>
      </h4>
      <div className="space-y-2">
        {recentBets.map((bet) => {
          const market = getMarketById(bet.marketId);
          return (
            <div
              key={bet.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`text-2xl flex-shrink-0 ${bet.outcome === 'YES' ? 'text-green-600' : 'text-red-600'}`}>
                  {bet.outcome === 'YES' ? '✅' : '❌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${bet.outcome === 'YES' ? 'text-green-700' : 'text-red-700'}`}>
                      {bet.outcome}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-gray-900">${bet.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {market?.question || `Market ${bet.marketId}`}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-xs text-gray-400">
                  {getTimeAgo(bet.timestamp)}
                </div>
                {bet.settled && (
                  <div className={`text-xs font-bold mt-1 ${bet.won ? 'text-green-600' : 'text-red-600'}`}>
                    {bet.won ? `+$${bet.potentialPayout.toFixed(2)}` : `Lost`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
