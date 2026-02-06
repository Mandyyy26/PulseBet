'use client';
import { useBettingStore } from '@/store/bettingStore';

export function BetHistory() {
  const bets = useBettingStore((state) => state.bets);
  const getMarketById = useBettingStore((state) => state.getMarketById); // ✅ Now works

  if (bets.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 text-center border border-white/20">
        <div className="text-6xl mb-3">📜</div>
        <p className="font-medium text-lg text-white">No bets yet</p>
        <p className="text-sm mt-1 text-white/60">Place your first bet to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Bet History</h3>
        <span className="text-sm text-white/60">
          {bets.length} bet{bets.length !== 1 ? 's' : ''} • ${bets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} total
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {Array.from(bets).reverse().map((bet) => {
          const market = getMarketById(bet.marketId);
          
          return (
            <div
              key={bet.id}
              className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg">
                      {market?.eventType === 'SPORTS' ? '⚽' :
                       market?.eventType === 'CRYPTO' ? '₿' :
                       market?.eventType === 'GAMING' ? '🎮' : '📊'}
                    </span>
                    <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                      {market?.category || 'Market'}
                    </span>
                    {market?.isLive && market.status === 'LIVE' && (
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold animate-pulse">
                        🔴 LIVE
                      </span>
                    )}
                    {market?.status === 'SETTLED' && (
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        bet.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {bet.won ? '✅ WON' : '❌ LOST'}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white text-sm mb-1">
                    {market?.question || bet.marketId}
                  </p>
                  <p className="text-xs text-white/50">
                    {bet.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      bet.outcome === 'YES'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {bet.outcome}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-white/60">Bet: </span>
                    <strong className="text-white">${bet.amount.toFixed(2)}</strong>
                  </div>
                  <div className="text-white/40">•</div>
                  <div>
                    <span className="text-white/60">Odds: </span>
                    <strong className="text-white">{bet.odds}%</strong>
                  </div>
                </div>
                <div>
                  <span className="text-white/60">Potential: </span>
                  <strong className="text-yellow-400">${bet.potentialPayout.toFixed(2)}</strong>
                </div>
              </div>

              {bet.settled && (
                <div className={`mt-3 p-3 rounded-lg text-center font-bold ${
                  bet.won 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
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
