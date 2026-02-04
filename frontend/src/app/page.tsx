'use client';
import { useYellow } from '@/hooks/useYellow';
import { ConnectWallet } from '@/components/ConnectWallet';

export default function Home() {
  const { 
    connected, 
    balance, 
    loading, 
    error, 
    walletAddress, 
    isWalletConnected,
    openSession,
    closeSession
  } = useYellow();

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 text-gray-900">
            PulseBet
          </h1>
          <p className="text-gray-600 text-lg">
            Instant, gasless betting powered by Yellow Network
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
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium opacity-90">Session Active</span>
                  </div>
                  <p className="text-sm opacity-75 mb-2">Available Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${balance}</span>
                    <span className="text-xl opacity-90">USDC</span>
                  </div>
                  <p className="text-xs opacity-60 mt-4 font-mono">
                    {walletAddress}
                  </p>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <span className="text-green-600 text-xl">🎉</span>
                  <div>
                    <p className="text-green-700 text-sm">
                      Your Yellow Network session is active and ready for betting.
                    </p>
                  </div>
                </div>

                {/* Close Session */}
                <button
                  onClick={closeSession}
                  className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                >
                  Close Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Markets */}
        {connected && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-2xl font-semibold">Active Markets</h2>
            </div>
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium mb-2">Coming Tomorrow</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
