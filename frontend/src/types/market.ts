export type MarketOutcome = 'YES' | 'NO';
export type MarketStatus = 'UPCOMING' | 'LIVE' | 'CLOSED' | 'SETTLED';
export type EventType = 'SPORTS' | 'CRYPTO' | 'GAMING' | 'CREATOR';

export interface Market {
  id: string;
  question: string;
  description: string;
  category: string;
  eventType: EventType;
  icon: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  totalVolume: number;
  yesOdds: number;
  noOdds: number;
  status: MarketStatus;
  result?: MarketOutcome;
  isLive: boolean;
  autoResolve: boolean;
  betCount: number;
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
  settled?: boolean;
  won?: boolean;
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

export interface LiveEvent {
  id: string;
  name: string;
  type: EventType;
  description: string;
  startTime: Date;
  isLive: boolean;
  markets: Market[];
  currentScore?: string;
  participants?: string[];
}
