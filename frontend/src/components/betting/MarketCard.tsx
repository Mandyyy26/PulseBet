'use client';
import { useState } from 'react';
import type { Market } from '@/types/market';
import { useBettingStore } from '@/store/bettingStore';
import { CountdownTimer } from './CountdownTimer';
import { LiveBadge } from './LiveBadge';

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [betAmount, setBetAmount] = useState<string>('10');
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { placeBet, balance, getPositionByMarket } = useBettingStore();
  const position = getPositionByMarket(market.id);

  const isMarketClosed = market.status !== 'LIVE';

  const handlePlaceBet = async (outcome: 'YES' | 'NO') => {
    const amount = parseFloat(betAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid amount');
      return;
    }

    if (amount > balance.available) {
      setError('Insufficient balance');
      return;
    }

    setIsPlacingBet(true);
    setError(null);
    setSelectedOutcome(outcome);

    try {
      await placeBet(market.id, outcome, amount);
      setBetAmount('10');
      setSelectedOutcome(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleMarketExpire = () => {
    console.log(`⏱️ Market ${market.id} expired, awaiting resolution...`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition ${
      isMarketClosed ? 'opacity-75' : ''
    }`}>
      {/* Live Header */}
      {market.isLive && market.status === 'LIVE' && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LiveBadge />
            <span className="text-xs font-medium opacity-90">
              {market.betCount} bets placed
            </span>
          </div>
          <CountdownTimer endTime={market.endTime} onExpire={handleMarketExpire} />
        </div>
      )}

      {/* Upcoming Badge */}
      {market.status === 'UPCOMING' && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 flex items-center justify-between text-sm">
          <span className="font-medium">📅 Upcoming Market</span>
          <span>Opens in {Math.floor((market.startTime.getTime() - Date.now()) / 60000)}m</span>
        </div>
      )}

      {/* Settled Badge */}
      {market.status === 'SETTLED' && market.result && (
        <div className="bg-orange-100 text-orange-800 px-4 py-2 flex items-center gap-2 text-sm font-bold">
          <span>🏁</span>
          <span>SETTLED: {market.result} WON</span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{market.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                market.eventType === 'SPORTS' ? 'bg-green-100 text-green-700' :
                market.eventType === 'CRYPTO' ? 'bg-orange-100 text-orange-700' :
                market.eventType === 'GAMING' ? 'bg-purple-100 text-purple-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {market.category}
              </span>
              {market.isLive && (
                <span className="text-xs text-gray-500">
                  • {market.duration} min market
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {market.question}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {market.description}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <span>💰</span>
            <span className="font-medium">${market.totalVolume.toFixed(2)}</span>
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
              style={{ width: `${market.yesOdds}%` }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 font-bold">YES {market.yesOdds}%</span>
            <span className="text-red-600 font-bold">NO {market.noOdds}%</span>
          </div>
        </div>

        {/* Current Position */}
        {position && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 font-medium">Your Position:</span>
              <span className="text-purple-900 font-bold">
                ${position.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              {position.yesAmount > 0 && (
                <span className="text-green-700">✅ YES: ${position.yesAmount.toFixed(2)}</span>
              )}
              {position.noAmount > 0 && (
                <span className="text-red-700">❌ NO: ${position.noAmount.toFixed(2)}</span>
              )}
            </div>
          </div>
        )}

        {/* Betting Interface */}
        <div className="space-y-3">
          {market.status === 'LIVE' ? (
            <>
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount (USDC)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  step="1"
                  disabled={isPlacingBet}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              {/* Bet Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePlaceBet('YES')}
                  disabled={isPlacingBet}
                  className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPlacingBet && selectedOutcome === 'YES' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Betting...
                    </span>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">✅</div>
                      <div className="text-sm opacity-90">YES</div>
                      <div className="text-xs opacity-75">{market.yesOdds}% odds</div>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePlaceBet('NO')}
                  disabled={isPlacingBet}
                  className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPlacingBet && selectedOutcome === 'NO' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Betting...
                    </span>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">❌</div>
                      <div className="text-sm opacity-90">NO</div>
                      <div className="text-xs opacity-75">{market.noOdds}% odds</div>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </>
          ) : market.status === 'UPCOMING' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-800 font-medium">Market opens soon</p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-orange-800 font-medium">Market Settled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
