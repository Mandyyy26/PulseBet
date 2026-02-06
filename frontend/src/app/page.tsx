'use client';
import { useEffect, useState } from 'react';
import { useYellow } from '@/hooks/useYellow';
import { useBettingStore } from '@/store/bettingStore';
import { ConnectWallet } from '@/components/ConnectWallet';
import { LiveMatchSelector } from '@/components/soccer/LiveMatchSelector';
import { SoccerMarketCreator } from '@/components/soccer/SoccerMarketCreator';
import { MarketCard } from '@/components/betting/MarketCard';
import { BalanceCard } from '@/components/betting/BalanceCard';
import { BetHistory } from '@/components/betting/BetHistory';
import { LiveActivityFeed } from '@/components/betting/LiveActivityFeed';
import type { LiveMatch } from '@/types/soccer';
import { SettlementModal } from '@/components/betting/SettlementModal';

export default function Home() {
  const {
    connected,
    loading,
    error: yellowError,
    isWalletConnected,
    address,
    balance: yellowBalance,
    channelId,
    openSession,
    closeSession,
  } = useYellow();

  const { 
    markets, 
    setInitialDeposit,
    autoResolveExpiredMarkets 
  } = useBettingStore();

  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [depositAmount, setDepositAmount] = useState('100');
  const [showDepositForm, setShowDepositForm] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);


  // Auto-resolve expired markets
  useEffect(() => {
    const interval = setInterval(() => {
      autoResolveExpiredMarkets();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoResolveExpiredMarkets]);

  // Sync Yellow balance with betting store
  useEffect(() => {
    if (connected && yellowBalance > 0) {
      setInitialDeposit(yellowBalance);
      console.log('💰 Balance synced:', yellowBalance, 'USDC');
    }
  }, [connected, yellowBalance, setInitialDeposit]);

  useEffect(() => {
    if (!connected && !loading) {
      setShowDepositForm(true);
      setSelectedMatch(null);
    }
  }, [connected, loading]);


  // Check for resolved markets
  const hasResolvedMarkets = markets.some(m => m.status === 'SETTLED');

  // Handle deposit
  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > 10000) {
      alert('Maximum deposit is 10,000 USDC');
      return;
    }

    await openSession(amount);
    
    if (!yellowError) {
      setShowDepositForm(false);
    }
  };

  // Handle close session
  const handleCloseSession = async () => {
    const confirmed = confirm(
      'Are you sure you want to close your session? All markets will be settled and funds returned to your wallet.'
    );
    
    if (confirmed) {
      // Show settlement modal first
      setShowSettlement(true);
      
      // Then close the session
      await closeSession();
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">⚽</div>
              <div>
                <h1 className="text-3xl font-bold text-white">PulseBet</h1>
                <p className="text-sm text-white/70">Instant Soccer Betting on Yellow Network</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {connected && channelId && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2">
                  <div className="text-xs text-green-300 font-semibold">STATE CHANNEL ACTIVE</div>
                  <div className="text-xs text-green-200 mt-1">
                    {channelId.substring(0, 8)}...{channelId.substring(channelId.length - 6)}
                  </div>
                </div>
              )}
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Hero Section */}
          {!isWalletConnected && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-center shadow-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                ⚡ Instant Soccer Betting
              </h2>
              <p className="text-lg text-gray-800 mb-6">
                Bet on live matches with zero gas fees using Yellow Network state channels
              </p>
              <div className="flex items-center justify-center gap-8 text-gray-900">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🔥</div>
                  <div className="text-sm font-semibold">Instant Settlement</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">⚡</div>
                  <div className="text-sm font-semibold">Zero Gas Fees</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🔒</div>
                  <div className="text-sm font-semibold">State Channels</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Connect Wallet */}
          {!isWalletConnected && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-lg">
                  1
                </div>
                <h2 className="text-2xl font-semibold text-white">Connect Your Wallet</h2>
              </div>
              <p className="text-white/70 mb-4">
                Connect your wallet to start betting on live soccer matches. We support MetaMask and other Web3 wallets.
              </p>
              <div className="flex justify-center">
                <ConnectWallet />
              </div>
            </div>
          )}

          {/* Step 2: Open Yellow Session */}
          {isWalletConnected && !connected && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  connected ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                }`}>
                  {connected ? '✓' : '2'}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Open Yellow Network Session</h2>
                  <p className="text-sm text-white/60">Create a state channel for instant, gasless betting</p>
                </div>
              </div>

              {showDepositForm && !loading && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Deposit Amount (Testnet USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={loading}
                        placeholder="Enter amount"
                        min="1"
                        max="10000"
                        step="10"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 font-medium">
                        USDC
                      </div>
                    </div>
                    <p className="text-white/50 text-xs mt-1">
                      💡 Using Sepolia testnet - No real money required
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 50, 100, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDepositAmount(amount.toString())}
                          disabled={loading}
                          className={`px-3 py-2 rounded-lg font-semibold transition ${
                            depositAmount === amount.toString()
                              ? 'bg-yellow-500 text-gray-900'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          } disabled:opacity-50`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yellow Network Info */}
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-400 text-xl">🟡</span>
                      <div className="text-yellow-100 text-xs space-y-1">
                        <p className="font-semibold">Yellow Network State Channels</p>
                        <p>• Creates on-chain state channel (1 transaction)</p>
                        <p>• All bets happen off-chain (instant & gasless)</p>
                        <p>• Settle on-chain when closing (1 transaction)</p>
                        <p>• Network: Sepolia Testnet</p>
                      </div>
                    </div>
                  </div>

                  {/* Need Test Tokens */}
                  <div className="text-center">
                    <p className="text-white/60 text-xs mb-2">Need testnet tokens?</p>
                    <a
                      href="https://clearnet-sandbox.yellow.com/faucet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold underline"
                    >
                      Get Test USDC from Yellow Faucet →
                    </a>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        Opening State Channel...
                      </span>
                    ) : (
                      `🟡 Open State Channel with ${depositAmount} USDC`
                    )}
                  </button>
                </div>
              )}

              {loading && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <span className="text-blue-200 font-semibold">Creating State Channel...</span>
                  </div>
                  <div className="text-blue-100 text-xs space-y-2">
                    <p>⏳ Step 1: Authenticating with Yellow Network...</p>
                    <p>⏳ Step 2: Creating state channel on Sepolia...</p>
                    <p>⏳ Step 3: Funding channel with USDC...</p>
                    <p className="text-blue-200 font-semibold mt-3">
                      Please confirm transactions in your wallet
                    </p>
                  </div>
                </div>
              )}

              {yellowError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200 text-sm mb-2">
                    <strong>⚠️ Error:</strong> {yellowError}
                  </p>
                  {yellowError.includes('insufficient') && (
                    <a
                      href="https://clearnet-sandbox.yellow.com/faucet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-200 hover:text-white underline text-sm font-medium"
                    >
                      Get Test USDC from Faucet →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Session UI */}
          {connected && (
            <>
              {/* Balance and Close Session */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <BalanceCard />
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-bold text-lg mb-3">Session Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white/60 text-xs">Channel ID</p>
                      <p className="text-white text-sm font-mono">
                        {channelId?.substring(0, 10)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Network</p>
                      <p className="text-white text-sm">Sepolia Testnet</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-green-400 text-sm font-semibold">Active</p>
                      </div>
                    </div>

                    {hasResolvedMarkets && (
                      <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-3 mt-4">
                        <p className="text-orange-200 text-xs mb-2">
                          ⚠️ Markets resolved. Close session to settle.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleCloseSession}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                        hasResolvedMarkets
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50'
                      } disabled:opacity-50`}
                    >
                      {loading ? 'Closing...' : hasResolvedMarkets ? '🔒 Close & Settle' : 'Close Session'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Select Match */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-lg">
                    3
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Select Live Match</h2>
                </div>
                <LiveMatchSelector onMatchSelected={setSelectedMatch} />
              </div>

              {/* Step 4: Create Market */}
              {selectedMatch && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-lg">
                      4
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Create Betting Market</h2>
                  </div>
                  <SoccerMarketCreator match={selectedMatch} />
                </div>
              )}

              {/* Active Markets */}
              {markets.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Active Markets</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {markets
                      .filter(m => m.status === 'LIVE')
                      .map(market => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                  </div>
                </div>
              )}

              {/* Bet History & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BetHistory />
                <LiveActivityFeed />
              </div>

              {/* Settled Markets */}
              {markets.some(m => m.status === 'SETTLED') && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Settled Markets</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {markets
                      .filter(m => m.status === 'SETTLED')
                      .map(market => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            Built with ⚡ Yellow Network State Channels | Powered by API-Football
          </p>
          <p className="text-white/40 text-xs mt-2">
            Testnet Demo - No Real Money Involved
          </p>
        </div>
      </footer>
      {showSettlement && (

  <SettlementModal
    isOpen={showSettlement}
    onClose={() => {
      setShowSettlement(false);
      // Optionally clear markets and reset
      useBettingStore.getState().clearAllMarkets();
    }}
    channelId={channelId || undefined}
  />
)}
    </div>
  );
}
