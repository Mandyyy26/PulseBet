'use client';
import { useYellow } from '@/hooks/useYellow';
import { ConnectWallet } from '@/components/ConnectWallet';
import { AdminPanel } from '@/components/betting/AdminPanel';
import { MarketCard } from '@/components/betting/MarketCard';
import { BalanceCard } from '@/components/betting/BalanceCard';
import { BetHistory } from '@/components/betting/BetHistory';
import { SettlementModal } from '@/components/betting/SettlementModal';
import { useBettingStore } from '@/store/bettingStore';

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

  const { markets } = useBettingStore();
  const hasResolvedMarkets = markets.some(m => m.status === 'SETTLED');

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 text-gray-900">
            Yellow Prediction Markets
          </h1>
          <p className="text-gray-600 text-lg">
            Instant, gasless betting powered by Yellow Network ⚡
          </p>
        </div>

        {/* Step 1: Connect Wallet */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isWalletConnected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {isWalletConnected ? '✓' : '1'}
            </div>
            <h2 className="text-2xl font-semibold">Connect Wallet</h2>
          </div>
          <ConnectWallet />
        </div>

        {/* Step 2: Open Session */}
        {isWalletConnected && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                connected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {connected ? '✓' : '2'}
              </div>
              <h2 className="text-2xl font-semibold">Open Yellow Session</h2>
            </div>

            {!connected && !loading && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Create a state channel session to enable instant betting without gas fees.
                </p>
                <button
                  onClick={openSession}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold shadow-lg"
                >
                  🟡 Open Session
                </button>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                <span className="text-gray-600 font-medium">Opening session...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm mb-3">
                  <strong>Error:</strong> {error}
                </p>
                <button
                  onClick={openSession}
                  className="text-red-600 hover:text-red-800 underline text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {connected && (
              <div className="space-y-6">
                <BalanceCard />
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-green-600 text-xl">🎉</span>
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold mb-1">Session Active!</p>
                    <p className="text-green-700 text-sm">
                      Start betting below. All bets are instant and gasless.
                    </p>
                  </div>
                </div>

                {hasResolvedMarkets && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-800 font-semibold mb-2">
                      ⚠️ Markets Resolved
                    </p>
                    <p className="text-orange-700 text-sm mb-3">
                      Some markets have been settled. Close your session to claim winnings.
                    </p>
                    <button
                      onClick={closeSession}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition font-bold shadow-lg"
                    >
                      🔒 Close Session & Settle
                    </button>
                  </div>
                )}

                {!hasResolvedMarkets && (
                  <button
                    onClick={closeSession}
                    className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                  >
                    Close Session
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Markets & Betting */}
        {connected && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                Active Markets
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {markets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            </div>

            {/* Bet History */}
            <div className="mt-8">
              <BetHistory />
            </div>
          </>
        )}
      </div>

      {/* Settlement Modal */}
      <SettlementModal
        isOpen={showSettlement}
        onClose={() => setShowSettlement(false)}
        onComplete={handleSettlementComplete}
      />

      {/* Admin Panel for Testing */}
      {connected && <AdminPanel />}
      
    </main>
  );
}
