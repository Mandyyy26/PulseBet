'use client';
import { useState } from 'react';
import { useBettingStore } from '@/store/bettingStore';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { markets, resolveMarket } = useBettingStore();

  const openMarkets = markets.filter(m => m.status === 'OPEN');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 text-sm font-medium"
      >
        🔧 Admin Panel
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl w-96 p-6 border-2 border-purple-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-purple-900">🔧 Admin Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Resolve markets to test settlement flow
        </p>

        {openMarkets.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            No open markets to resolve
          </div>
        ) : (
          openMarkets.map(market => (
            <div key={market.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-sm text-gray-900 mb-3">
                {market.question}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resolveMarket(market.id, 'YES');
                    alert(`Market resolved: YES`);
                  }}
                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm font-medium"
                >
                  Resolve YES
                </button>
                <button
                  onClick={() => {
                    resolveMarket(market.id, 'NO');
                    alert(`Market resolved: NO`);
                  }}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm font-medium"
                >
                  Resolve NO
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
