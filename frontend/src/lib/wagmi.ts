import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask, injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(), // Supports all injected wallets
    metaMask(),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});