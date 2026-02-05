'use client';
import { useEffect } from 'react';
import { useYellow } from '@/hooks/useYellow';
import { ConnectWallet } from '@/components/ConnectWallet';
import { AdminPanel } from '@/components/betting/AdminPanel';
import { MarketCard } from '@/components/betting/MarketCard';
import { BalanceCard } from '@/components/betting/BalanceCard';
import { BetHistory } from '@/components/betting/BetHistory';
import { LiveActivityFeed } from '@/components/betting/LiveActivityFeed';
import { SettlementModal } from '@/components/betting/SettlementModal';
import { useBettingStore } from '@/store/bettingStore';
import { LIVE_EVENT } from '@/lib/markets/mockData';

export default function Home() {
  const { 
    connected, 
    loading, 
    error, 
    isWalletConnected,
    openSession,
    closeSession,
    showSettlement,
    setShowSettlement,
    handleSettlementComplete,
  } = useYellow();

  const { markets, autoResolveExpiredMarkets } = useBettingStore();
  const hasResolvedMarkets = markets.some(m => m.status === 'SETTLED');
  const liveMarkets = markets.filter(m => m.status === 'LIVE');
  const upcomingMarkets = markets.filter(m => m.status === 'UPCOMING');

  // Auto-resolve expired markets
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      autoResolveExpiredMarkets();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [connected, autoResolveExpiredMarkets]);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200"></span>
            </span>
            LIVE EVENT BETTING
          </div>
          <h1 className="text-6xl font-bold mb-3 text-white">
            ⚡ Bet on What's Happening <span className="text-yellow-400">Right Now</span>
          </h1>
          <p className="text-gray-300 text-xl">
            Instant bets • Zero gas fees • Powered by Yellow Network
          </p>
        </div>

        {/* Current Live Event Banner */}
        {connected && LIVE_EVENT.isLive && (
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{LIVE_EVENT.type === 'SPORTS' ? '⚽' : '🎮'}</span>
                  <h2 className="text-2xl font-bold">{LIVE_EVENT.name}</h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {LIVE_EVENT.description}
                  </span>
                </div>
                {LIVE_EVENT.currentScore && (
                  <p className="text-lg font-bold opacity-90">
                    Score: {LIVE_EVENT.currentScore}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Live Markets</p>
                <p className="text-4xl font-bold">{liveMarkets.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Connect Wallet */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                isWalletConnected ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
              }`}>
                {isWalletConnected ? '✓' : '1'}
              </div>
              <h2 className="text-2xl font-semibold text-white">Connect Wallet</h2>
            </div>
            <ConnectWallet />
          </div>

          {/* Step 2: Open Session */}
          {isWalletConnected && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  connected ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {connected ? '✓' : '2'}
                </div>
                <h2 className="text-2xl font-semibold text-white">Open Yellow Session</h2>
              </div>

              {!connected && !loading && (
                <button
                  onClick={openSession}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold shadow-lg"
                >
                  🟡 Start Betting
                </button>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  <span className="text-white font-medium">Opening session...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {connected && (
                <div className="space-y-4">
                  <BalanceCard />
                  {hasResolvedMarkets && (
                    <button
                      onClick={closeSession}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition font-bold shadow-lg"
                    >
                      🔒 Close Session & Settle
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Markets Grid */}
        {connected && liveMarkets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm">
                🔴
              </span>
              Live Markets
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {liveMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Markets */}
        {connected && upcomingMarkets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span>📅</span>
              Upcoming Markets
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </div>
        )}

        {/* Activity & History */}
        {connected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LiveActivityFeed />
            </div>
            <div className="lg:col-span-2">
              <BetHistory />
            </div>
          </div>
        )}
      </div>

      {/* Modals & Panels */}
      <SettlementModal
        isOpen={showSettlement}
        onClose={() => setShowSettlement(false)}
        onComplete={handleSettlementComplete}
      />
      
      {connected && <AdminPanel />}


    </main>
  );
}
