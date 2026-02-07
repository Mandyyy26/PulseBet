'use client';
import { useYellow } from '@/hooks/useYellow';

export function YellowStatus() {
  const { connected, channelId, balance } = useYellow();

  if (!connected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-500/90 backdrop-blur-lg rounded-lg px-4 py-3 shadow-lg border border-green-400">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
        <div className="text-white text-sm">
          <div className="font-bold">State Channel Active</div>
          <div className="text-xs opacity-90">
            {balance.toFixed(2)} USDC • {channelId?.substring(0, 8)}...
          </div>
        </div>
      </div>
    </div>
  );
}
