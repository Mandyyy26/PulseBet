'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const metaMaskConnector = connectors.find(
    (connector) => connector.name === 'MetaMask'
  );

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🦊</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Connected Wallet</p>
            <p className="font-mono text-sm font-semibold text-gray-900">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-red-600 hover:text-red-700 text-sm font-medium underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector })}
      className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-4 rounded-lg hover:from-orange-500 hover:to-orange-600 transition font-semibold shadow-lg flex items-center justify-center gap-3 group"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">🦊</span>
      <span>Connect MetaMask</span>
    </button>
  );
}
