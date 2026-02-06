'use client';
import { useState } from 'react';
import { getSoccerMarketGenerator } from '@/lib/soccer/marketGenerator';
import { getLiveMatchManager } from '@/lib/soccer/matchManager';
import { useBettingStore } from '@/store/bettingStore';
import type { LiveMatch } from '@/types/soccer';

interface SoccerMarketCreatorProps {
  match: LiveMatch | null;
}

export function SoccerMarketCreator({ match }: SoccerMarketCreatorProps) {
  const [creating, setCreating] = useState(false);

  if (!match) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6 text-center">
        <p className="text-white/70">Select a live match first to create betting markets</p>
      </div>
    );
  }

  const createMarket = async (type: 'goal' | 'corner' | 'card' | 'team') => {
    setCreating(true);
    try {
      const generator = getSoccerMarketGenerator();
      let market;

      switch (type) {
        case 'goal':
          market = generator.generateNextGoalMarket(match, 10);
          break;
        case 'corner':
          market = generator.generateCornerMarket(match, 5);
          break;
        case 'card':
          market = generator.generateCardMarket(match, 10);
          break;
        case 'team':
          market = generator.generateTeamToScoreMarket(match, 15);
          break;
      }

      // Add to betting store
      useBettingStore.setState(state => ({
        markets: [...state.markets, market]
      }));

      console.log('✅ Market created:', market.question);
    } catch (error) {
      console.error('Error creating market:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
      <h3 className="text-white font-bold text-xl mb-4">🎯 Create Betting Markets</h3>
      
      <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="font-bold">{match.teams.home.name} vs {match.teams.away.name}</p>
            <p className="text-sm opacity-75">{match.league.name} • {match.fixture.status.elapsed}'</p>
          </div>
          <div className="text-3xl font-bold">
            {match.goals.home} - {match.goals.away}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => createMarket('goal')}
          disabled={creating}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          ⚽ Goal in 10 min
        </button>

        <button
          onClick={() => createMarket('corner')}
          disabled={creating}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          ⛳ Corner in 5 min
        </button>

        <button
          onClick={() => createMarket('card')}
          disabled={creating}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          🟨 Card in 10 min
        </button>

        <button
          onClick={() => createMarket('team')}
          disabled={creating}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          ⚽ Next Goal Team
        </button>
      </div>

      <div className="mt-4 text-white/70 text-sm">
        <p>💡 Markets auto-resolve based on real match events</p>
        <p className="mt-1">📡 API updates every 30 seconds</p>
      </div>
    </div>
  );
}
