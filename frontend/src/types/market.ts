export type MarketOutcome = 'YES' | 'NO';

export interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  icon: string;
  endTime: Date;
  totalVolume: number;
  yesOdds: number;  // 0-100
  noOdds: number;   // 0-100
  status: 'OPEN' | 'CLOSED' | 'SETTLED';
  result?: MarketOutcome;
}

export interface Bet {
  id: string;
  marketId: string;
  userId: string;
  outcome: MarketOutcome;
  amount: number;
  odds: number;
  timestamp: Date;
  potentialPayout: number;
}

export interface Position {
  marketId: string;
  yesAmount: number;
  noAmount: number;
  totalAmount: number;
  potentialWin: number;
}

export interface UserBalance {
  available: number;
  locked: number;
  total: number;
}
