import { create } from 'zustand';
import type { Market, Bet, Position, UserBalance, MarketOutcome } from '@/types/market';

interface BettingState {
  // State
  markets: Market[];
  bets: Bet[];
  balance: UserBalance;
  initialDeposit: number;
  
  // Actions
  setInitialDeposit: (amount: number) => void;
  addMarket: (market: Market) => void;
  placeBet: (marketId: string, outcome: MarketOutcome, amount: number) => Promise<void>;
  resolveMarket: (marketId: string, outcome: MarketOutcome) => void;
  getUserBets: () => Bet[];
  getMarketById: (marketId: string) => Market | undefined;
  getPositionByMarket: (marketId: string) => Position | null;
  autoResolveExpiredMarkets: () => void;
  clearAllMarkets: () => void;
  settleUserBets: () => { totalWinnings: number; totalLosses: number }; // ✅ Added
  clearHistory: () => void; // ✅ Added
  updateBalance: (amount: number) => void; // ✅ Added
}

export const useBettingStore = create<BettingState>((set, get) => ({
  // Initial state
  markets: [],
  bets: [],
  balance: {
    available: 0,
    locked: 0,
    total: 0,
  },
  initialDeposit: 0,

  // Set initial deposit and balance
  setInitialDeposit: (amount: number) => {
    set({
      initialDeposit: amount,
      balance: {
        available: amount,
        locked: 0,
        total: amount,
      },
    });
    console.log(`💰 Initial deposit set: ${amount} USDC (Testnet)`);
  },

  // Add a market
  addMarket: (market: Market) => {
    set(state => ({
      markets: [...state.markets, market],
    }));
    console.log(`📊 Market added: ${market.question}`);
  },

  // Place a bet
  placeBet: async (marketId: string, outcome: MarketOutcome, amount: number) => {
    const state = get();
    const market = state.markets.find(m => m.id === marketId);

    if (!market) {
      throw new Error('Market not found');
    }

    if (market.status !== 'LIVE') {
      throw new Error('Market is not live');
    }

    if (amount > state.balance.available) {
      throw new Error(`Insufficient balance. Available: ${state.balance.available.toFixed(2)} USDC`);
    }

    if (amount <= 0) {
      throw new Error('Bet amount must be greater than 0');
    }

    // Calculate potential payout based on odds
    const odds = outcome === 'YES' ? market.yesOdds : market.noOdds;
    const potentialPayout = amount * (100 / odds);

    // Create bet
    const newBet: Bet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      marketId,
      userId: 'user-1',
      outcome,
      amount,
      odds,
      timestamp: new Date(),
      potentialPayout,
      settled: false,
    };

    // Update state
    set(state => ({
      bets: [...state.bets, newBet],
      balance: {
        ...state.balance,
        available: state.balance.available - amount,
        locked: state.balance.locked + amount,
        total: state.balance.total,
      },
      markets: state.markets.map(m => 
        m.id === marketId 
          ? { 
              ...m, 
              totalVolume: m.totalVolume + amount,
              betCount: m.betCount + 1,
            }
          : m
      ),
    }));

    console.log(`✅ Bet placed: ${amount} USDC on ${outcome} for market ${marketId}`);
    console.log(`   Potential payout: ${potentialPayout.toFixed(2)} USDC`);
  },

  // Resolve market
  resolveMarket: (marketId: string, outcome: MarketOutcome) => {
    const state = get();
    const market = state.markets.find(m => m.id === marketId);

    if (!market) {
      console.error('Market not found:', marketId);
      return;
    }

    if (market.status === 'SETTLED') {
      console.log('Market already settled:', marketId);
      return;
    }

    // Update market status
    set(state => ({
      markets: state.markets.map(m =>
        m.id === marketId
          ? { ...m, status: 'SETTLED', result: outcome, isLive: false }
          : m
      ),
    }));

    // Settle bets
    const marketBets = state.bets.filter(b => b.marketId === marketId && !b.settled);
    
    if (marketBets.length === 0) {
      console.log(`📊 Market ${marketId} resolved as ${outcome} (no bets to settle)`);
      return;
    }

    let totalWinnings = 0;
    let totalLosses = 0;
    let winnersCount = 0;
    let losersCount = 0;

    const updatedBets = state.bets.map(bet => {
      if (bet.marketId === marketId && !bet.settled) {
        const won = bet.outcome === outcome;
        
        if (won) {
          totalWinnings += bet.potentialPayout;
          winnersCount++;
        } else {
          totalLosses += bet.amount;
          losersCount++;
        }

        return {
          ...bet,
          settled: true,
          won,
        };
      }
      return bet;
    });

    // Update balance
    const lockedAmount = marketBets.reduce((sum, bet) => sum + bet.amount, 0);
    const newAvailable = state.balance.available + totalWinnings;
    const newLocked = state.balance.locked - lockedAmount;

    set({
      bets: updatedBets,
      balance: {
        available: newAvailable,
        locked: newLocked,
        total: newAvailable + newLocked,
      },
    });

    console.log(`🏁 Market ${marketId} settled: ${outcome}`);
    console.log(`   Winners: ${winnersCount} | Losers: ${losersCount}`);
    console.log(`   Winnings: ${totalWinnings.toFixed(2)} USDC | Losses: ${totalLosses.toFixed(2)} USDC`);
    console.log(`   New Balance: ${newAvailable.toFixed(2)} USDC available | ${newLocked.toFixed(2)} USDC locked`);
  },

  // Get user's bets
  getUserBets: () => {
    return get().bets;
  },

  // Get market by ID
  getMarketById: (marketId: string) => {
    return get().markets.find(m => m.id === marketId);
  },

  // Get position for a market
  getPositionByMarket: (marketId: string) => {
    const bets = get().bets.filter(b => b.marketId === marketId && !b.settled);
    
    if (bets.length === 0) return null;

    const yesAmount = bets.filter(b => b.outcome === 'YES').reduce((sum, b) => sum + b.amount, 0);
    const noAmount = bets.filter(b => b.outcome === 'NO').reduce((sum, b) => sum + b.amount, 0);
    const totalAmount = yesAmount + noAmount;
    const potentialWin = bets.reduce((max, b) => Math.max(max, b.potentialPayout), 0);

    return {
      marketId,
      yesAmount,
      noAmount,
      totalAmount,
      potentialWin,
    };
  },

  // Auto-resolve expired markets
  autoResolveExpiredMarkets: () => {
    const state = get();
    const now = Date.now();

    state.markets.forEach(market => {
      if (market.status === 'LIVE' && market.endTime.getTime() <= now) {
        // Randomly resolve for demo purposes
        const outcome: MarketOutcome = Math.random() > 0.5 ? 'YES' : 'NO';
        console.log(`⏰ Auto-resolving expired market: ${market.question} as ${outcome}`);
        get().resolveMarket(market.id, outcome);
      }
    });
  },

  // Clear all markets
  clearAllMarkets: () => {
    set({
      markets: [],
      bets: [],
    });
    console.log('🗑️ All markets cleared');
  },

  // ✅ Settle all user bets and calculate winnings
  settleUserBets: () => {
    const state = get();
    let totalWinnings = 0;
    let totalLosses = 0;

    state.bets.forEach(bet => {
      if (bet.settled && bet.won) {
        totalWinnings += bet.potentialPayout;
      } else if (bet.settled && !bet.won) {
        totalLosses += bet.amount;
      }
    });

    console.log(`💰 Settlement calculated: +${totalWinnings.toFixed(2)} USDC won, -${totalLosses.toFixed(2)} USDC lost`);
    
    return { totalWinnings, totalLosses };
  },

  // ✅ Clear bet history
  clearHistory: () => {
    set({ bets: [] });
    console.log('🗑️ Bet history cleared');
  },

  // ✅ Update balance (add or subtract)
  updateBalance: (amount: number) => {
    set(state => ({
      balance: {
        available: state.balance.available + amount,
        locked: state.balance.locked,
        total: state.balance.available + amount + state.balance.locked,
      },
    }));
    console.log(`💰 Balance updated: ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} USDC`);
  },
}));
