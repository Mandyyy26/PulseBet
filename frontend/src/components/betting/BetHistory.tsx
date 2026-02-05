'use client';
import { useBettingStore } from '@/store/bettingStore';

export function BetHistory() {
  const bets = useBettingStore((state) => state.bets);
  const getMarketById = useBettingStore((state) => state.getMarketById);
  const markets = useBettingStore((state) => state.markets);

  if (bets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-400">
        <div className="text-6xl mb-3">📜</div>
        <p className="font-medium text-lg">No bets yet</p>
        <p className="text-sm mt-1">Place your first bet to get started!</p>
      </div>
    );
  }

  // Get unique markets that have bets
  const marketStats = new Map<string, { market: any; totalBets: number; totalAmount: number }>();
  
  bets.forEach(bet => {
    const market = getMarketById(bet.marketId);
    if (market) {
      const existing = marketStats.get(bet.marketId);
      if (existing) {
        existing.totalBets++;
        existing.totalAmount += bet.amount;
      } else {
        marketStats.set(bet.marketId, {
          market,
          totalBets: 1,
          totalAmount: bet.amount
        });
      }
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Bet History</h3>
        <span className="text-sm text-gray-500">
          {bets.length} bet{bets.length !== 1 ? 's' : ''} • ${bets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} total
        </span>
      </div>

      <div className="space-y-3">
        {Array.from(bets).reverse().map((bet) => {
          const market = getMarketById(bet.marketId);
          return (
            <div
              key={bet.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {market?.eventType === 'SPORTS' ? '⚽' :
                       market?.eventType === 'CRYPTO' ? '₿' :
                       market?.eventType === 'GAMING' ? '🎮' : '📊'}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {market?.category || 'Market'}
                    </span>
                    {market?.isLive && market.status === 'LIVE' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                        🔴 LIVE
                      </span>
                    )}
                    {market?.status === 'SETTLED' && (
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        bet.won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {bet.won ? '✅ WON' : '❌ LOST'}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {market?.question || bet.marketId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bet.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      bet.outcome === 'YES'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {bet.outcome}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-600">Bet: </span>
                    <strong className="text-gray-900">${bet.amount.toFixed(2)}</strong>
                  </div>
                  <div className="text-gray-400">•</div>
                  <div>
                    <span className="text-gray-600">Odds: </span>
                    <strong className="text-gray-900">{bet.odds}%</strong>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Potential: </span>
                  <strong className="text-blue-600">${bet.potentialPayout.toFixed(2)}</strong>
                </div>
              </div>

              {bet.settled && (
                <div className={`mt-3 p-3 rounded-lg text-center font-bold ${
                  bet.won 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {bet.won 
                    ? `🎉 Won $${bet.potentialPayout.toFixed(2)}!` 
                    : `Lost $${bet.amount.toFixed(2)}`
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
