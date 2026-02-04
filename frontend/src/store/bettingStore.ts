import { create } from 'zustand';
import type { Market, Bet, Position, UserBalance } from '@/types/market';
import { MOCK_MARKETS } from '@/lib/markets/mockData';

interface BettingState {
  // State
  markets: Market[];
  bets: Bet[];
  positions: Map<string, Position>;
  balance: UserBalance;
  
  // Actions
  placeBet: (marketId: string, outcome: 'YES' | 'NO', amount: number) => Promise<void>;
  getMarketById: (id: string) => Market | undefined;
  getPositionByMarket: (marketId: string) => Position | undefined;
  getUserBets: () => Bet[];
  updateBalance: (amount: number) => void;
  initializeBalance: (amount: number) => void;
  resolveMarket: (marketId: string, outcome: 'YES' | 'NO') => void;
  settleUserBets: () => { totalWinnings: number; settledBets: Bet[] };
  clearHistory: () => void;
}

export const useBettingStore = create<BettingState>((set, get) => ({
  // Initial state
  markets: MOCK_MARKETS,
  bets: [],
  positions: new Map(),
  balance: {
    available: 100, // Start with $100 mock balance
    locked: 0,
    total: 100,
  },

  // Place a bet (off-chain simulation for now)
  placeBet: async (marketId, outcome, amount) => {
    const state = get();
    const market = state.markets.find(m => m.id === marketId);
    
    if (!market) {
      throw new Error('Market not found');
    }

    if (amount > state.balance.available) {
      throw new Error('Insufficient balance');
    }

    if (market.status !== 'OPEN') {
      throw new Error('Market is closed');
    }

    // Create bet
    const odds = outcome === 'YES' ? market.yesOdds : market.noOdds;
    const potentialPayout = amount * (100 / odds);
    
    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random()}`,
      marketId,
      userId: 'current-user', // Will be replaced with actual wallet address
      outcome,
      amount,
      odds,
      timestamp: new Date(),
      potentialPayout,
    };

    // Update position
    const existingPosition = state.positions.get(marketId);
    const newPosition: Position = existingPosition
      ? {
          ...existingPosition,
          yesAmount: outcome === 'YES' ? existingPosition.yesAmount + amount : existingPosition.yesAmount,
          noAmount: outcome === 'NO' ? existingPosition.noAmount + amount : existingPosition.noAmount,
          totalAmount: existingPosition.totalAmount + amount,
          potentialWin: existingPosition.potentialWin + potentialPayout,
        }
      : {
          marketId,
          yesAmount: outcome === 'YES' ? amount : 0,
          noAmount: outcome === 'NO' ? amount : 0,
          totalAmount: amount,
          potentialWin: potentialPayout,
        };

    // Update market volume
    const updatedMarkets = state.markets.map(m =>
      m.id === marketId
        ? { ...m, totalVolume: m.totalVolume + amount }
        : m
    );

    // Update balance
    const newBalance: UserBalance = {
      available: state.balance.available - amount,
      locked: state.balance.locked + amount,
      total: state.balance.total,
    };

    // Simulate network delay (Yellow Network would be instant in reality)
    await new Promise(resolve => setTimeout(resolve, 100));

    set({
      bets: [...state.bets, newBet],
      positions: new Map(state.positions).set(marketId, newPosition),
      markets: updatedMarkets,
      balance: newBalance,
    });

    console.log('✅ Bet placed:', newBet);
  },

  getMarketById: (id) => {
    return get().markets.find(m => m.id === id);
  },

  getPositionByMarket: (marketId) => {
    return get().positions.get(marketId);
  },

  getUserBets: () => {
    return get().bets;
  },

  updateBalance: (amount) => {
    const current = get().balance;
    set({
      balance: {
        available: current.available + amount,
        locked: current.locked,
        total: current.total + amount,
      },
    });
  },

  initializeBalance: (amount) => {
    set({
      balance: {
        available: amount,
        locked: 0,
        total: amount,
      },
    });
  },

  // Resolve a market (admin function)
  resolveMarket: (marketId, outcome) => {
    const state = get();
    const updatedMarkets = state.markets.map(m =>
      m.id === marketId
        ? { ...m, status: 'SETTLED' as const, result: outcome }
        : m
    );

    set({ markets: updatedMarkets });
    console.log(`✅ Market ${marketId} resolved as ${outcome}`);
  },

  // Calculate and settle all user bets
  settleUserBets: () => {
    const state = get();
    let totalWinnings = 0;
    const settledBets: Bet[] = [];

    state.bets.forEach(bet => {
      const market = state.markets.find(m => m.id === bet.marketId);
      
      if (market && market.status === 'SETTLED' && market.result) {
        if (bet.outcome === market.result) {
          // User won!
          totalWinnings += bet.potentialPayout;
          settledBets.push({ ...bet });
          console.log(`🎉 Won bet ${bet.id}: $${bet.potentialPayout.toFixed(2)}`);
        } else {
          // User lost
          console.log(`😢 Lost bet ${bet.id}: $${bet.amount.toFixed(2)}`);
        }
      }
    });

    console.log(`💰 Total winnings: $${totalWinnings.toFixed(2)}`);
    return { totalWinnings, settledBets };
  },

  // Clear bet history after settlement
  clearHistory: () => {
    set({
      bets: [],
      positions: new Map(),
    });
  },
}));
