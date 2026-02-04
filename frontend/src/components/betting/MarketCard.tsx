'use client';
import { useState } from 'react';
import type { Market } from '@/types/market';
import { useBettingStore } from '@/store/bettingStore';

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

  const isMarketClosed = market.status !== 'OPEN';

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
      setBetAmount('10'); // Reset
      setSelectedOutcome(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition ${
      isMarketClosed ? 'opacity-75 border-2 border-orange-300' : ''
    }`}>
      {/* Market Status Badge */}
      {isMarketClosed && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
            {market.status === 'SETTLED' && market.result && (
              <>
                🏁 SETTLED: {market.result} WON
              </>
            )}
            {market.status === 'CLOSED' && (
              <>
                🔒 CLOSED
              </>
            )}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{market.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {market.question}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {market.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span className="bg-blue-50 px-3 py-1 rounded-full">
          {market.category}
        </span>
        <span>💰 ${market.totalVolume.toFixed(2)} volume</span>
        <span>⏰ {new Date(market.endTime).toLocaleDateString()}</span>
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
          {position.yesAmount > 0 && (
            <div className="text-xs text-purple-600 mt-1">
              YES: ${position.yesAmount.toFixed(2)}
            </div>
          )}
          {position.noAmount > 0 && (
            <div className="text-xs text-purple-600">
              NO: ${position.noAmount.toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Betting Interface */}
      <div className="space-y-3">
        {/* Show message if market is closed */}
        {isMarketClosed ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-orange-800 font-medium mb-1">
              Market Settled
            </p>
            <p className="text-orange-700 text-sm">
              Close your session to claim {market.result === 'YES' && position?.yesAmount ? 'winnings' : market.result === 'NO' && position?.noAmount ? 'winnings' : 'results'}
            </p>
          </div>
        ) : (
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
              {/* YES Button */}
              <button
                onClick={() => handlePlaceBet('YES')}
                disabled={isPlacingBet}
                className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* NO Button */}
              <button
                onClick={() => handlePlaceBet('NO')}
                disabled={isPlacingBet}
                className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                ⚠️ {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
