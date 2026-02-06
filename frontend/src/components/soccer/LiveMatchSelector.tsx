'use client';
import { useState } from 'react';
import { getSoccerAPIClient } from '@/lib/soccer/apiClient';
import { getLiveMatchManager } from '@/lib/soccer/matchManager';
import type { LiveMatch } from '@/types/soccer';

interface LiveMatchSelectorProps {
  onMatchSelected: (match: LiveMatch) => void;
}

export function LiveMatchSelector({ onMatchSelected }: LiveMatchSelectorProps) {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const loadLiveMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiClient = getSoccerAPIClient();
      const liveMatches = await apiClient.getLiveMatches();
      
      // Filter for interesting matches (in-play, not just starting)
      const activeMatches = liveMatches.filter(
        m => m.fixture.status.elapsed && m.fixture.status.elapsed > 5
      );

      setMatches(activeMatches);
      console.log(`✅ Found ${activeMatches.length} active matches`);
      
      if (activeMatches.length === 0) {
        setError('No live matches found at the moment. Please try again later or check back when matches are in progress.');
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('Error loading matches:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMatch = async (match: LiveMatch) => {
    try {
      const manager = getLiveMatchManager();
      await manager.startTracking(match.fixture.id);
      setSelectedMatch(match.fixture.id);
      onMatchSelected(match);
    } catch (error) {
      console.error('Error selecting match:', error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-xl">⚽ Select Live Match</h3>
          <p className="text-white/60 text-sm mt-1">Real-time soccer matches from around the world</p>
        </div>
        <button
          onClick={loadLiveMatches}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              Loading...
            </span>
          ) : (
            '🔍 Find Live Matches'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-200 font-semibold mb-2">⚠️ Error</p>
          <p className="text-red-100 text-sm mb-3">{error}</p>
          
          {error.includes('401') && (
            <div className="bg-red-600/20 rounded p-3 mt-3">
              <p className="text-red-100 text-xs font-semibold mb-2">Fix: Invalid API Key</p>
              <ol className="text-red-100 text-xs space-y-1 list-decimal list-inside">
                <li>Go to: https://dashboard.api-football.com/register</li>
                <li>Register and verify your email</li>
                <li>Login to dashboard and copy your API key</li>
                <li>Add to .env.local: NEXT_PUBLIC_APISPORTS_KEY=your_key</li>
                <li>Restart server: npm run dev</li>
              </ol>
            </div>
          )}

          {error.includes('403') && (
            <div className="bg-red-600/20 rounded p-3 mt-3">
              <p className="text-red-100 text-xs font-semibold mb-2">Fix: Account Not Activated</p>
              <ol className="text-red-100 text-xs space-y-1 list-decimal list-inside">
                <li>Check your email for verification link</li>
                <li>Click the verification link</li>
                <li>Login to: https://dashboard.api-football.com/</li>
                <li>Make sure your API key is active</li>
              </ol>
            </div>
          )}

          {error.includes('429') && (
            <div className="bg-red-600/20 rounded p-3 mt-3">
              <p className="text-red-100 text-xs">
                Daily limit reached (100 requests). Try again tomorrow or upgrade your plan.
              </p>
            </div>
          )}

          {error.includes('No live matches') && (
            <div className="bg-blue-600/20 rounded p-3 mt-3">
              <p className="text-blue-100 text-xs">
                💡 <strong>Tip:</strong> Soccer matches are more likely to be live during:
              </p>
              <ul className="text-blue-100 text-xs mt-2 space-y-1">
                <li>• European hours: 12 PM - 11 PM GMT (5:30 PM - 4:30 AM IST)</li>
                <li>• Weekends (Saturday/Sunday)</li>
                <li>• Midweek evenings (Tuesday/Wednesday/Thursday)</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {matches.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-white/70 border border-white/10 rounded-lg">
          <div className="text-5xl mb-3">⚽</div>
          <p className="mb-2 font-medium">No matches loaded yet</p>
          <p className="text-sm">Click "Find Live Matches" to search for ongoing soccer games worldwide</p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          <div className="text-white/70 text-sm mb-3">
            Found {matches.length} live match{matches.length !== 1 ? 'es' : ''} in progress
          </div>
          
          {matches.slice(0, 10).map((match) => (
            <div
              key={match.fixture.id}
              className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer border-2 ${
                selectedMatch === match.fixture.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-transparent'
              }`}
              onClick={() => handleSelectMatch(match)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold animate-pulse">
                      🔴 LIVE {match.fixture.status.elapsed}'
                    </span>
                    <span className="text-xs text-white/70">
                      {match.league.name} • {match.league.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <img
                        src={match.teams.home.logo}
                        alt={match.teams.home.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-white font-semibold">
                        {match.teams.home.name}
                      </span>
                    </div>
                    <div className="text-white font-bold text-2xl">
                      {match.goals.home} - {match.goals.away}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-white font-semibold">
                        {match.teams.away.name}
                      </span>
                      <img
                        src={match.teams.away.logo}
                        alt={match.teams.away.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
                {selectedMatch === match.fixture.id && (
                  <div className="ml-4 text-green-500 text-2xl">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {matches.length > 10 && (
        <p className="text-white/50 text-sm mt-3 text-center">
          Showing top 10 matches. {matches.length - 10} more available.
        </p>
      )}
    </div>
  );
}
