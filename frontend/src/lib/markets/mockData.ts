import type { Market, LiveEvent } from '@/types/market';

const now = new Date();
const in5min = new Date(now.getTime() + 5 * 60000);
const in10min = new Date(now.getTime() + 10 * 60000);
const in15min = new Date(now.getTime() + 15 * 60000);

export const LIVE_MARKETS: Market[] = [
  {
    id: 'soccer-next-goal-1',
    question: 'Will there be a goal in the next 5 minutes?',
    description: 'Market resolves YES if either team scores within the next 5 minutes of match time.',
    category: 'Soccer',
    eventType: 'SPORTS',
    icon: '⚽',
    startTime: now,
    endTime: in5min,
    duration: 5,
    totalVolume: 0,
    yesOdds: 35,
    noOdds: 65,
    status: 'LIVE',
    isLive: true,
    autoResolve: true,
    betCount: 0,
  },
  {
    id: 'btc-price-check',
    question: 'Will Bitcoin break $95,000 in next 10 minutes?',
    description: 'Market resolves YES if BTC/USD reaches or exceeds $95,000 on any major exchange.',
    category: 'Crypto',
    eventType: 'CRYPTO',
    icon: '₿',
    startTime: now,
    endTime: in10min,
    duration: 10,
    totalVolume: 0,
    yesOdds: 45,
    noOdds: 55,
    status: 'LIVE',
    isLive: true,
    autoResolve: true,
    betCount: 0,
  },
  {
    id: 'valorant-round-win',
    question: 'Will Team Liquid win this round?',
    description: 'Current round: 7. Market resolves based on round 7 outcome.',
    category: 'Valorant',
    eventType: 'GAMING',
    icon: '🎮',
    startTime: now,
    endTime: in10min,
    duration: 10,
    totalVolume: 0,
    yesOdds: 52,
    noOdds: 48,
    status: 'LIVE',
    isLive: true,
    autoResolve: true,
    betCount: 0,
  },
];

export const UPCOMING_MARKETS: Market[] = [
  {
    id: 'soccer-halftime-score',
    question: 'Will the halftime score be 1-0?',
    description: 'Market opens at minute 40, resolves at halftime (minute 45).',
    category: 'Soccer',
    eventType: 'SPORTS',
    icon: '⚽',
    startTime: in10min,
    endTime: in15min,
    duration: 5,
    totalVolume: 0,
    yesOdds: 40,
    noOdds: 60,
    status: 'UPCOMING',
    isLive: false,
    autoResolve: true,
    betCount: 0,
  },
];

export const LIVE_EVENT: LiveEvent = {
  id: 'liverpool-vs-arsenal',
  name: 'Liverpool vs Arsenal',
  type: 'SPORTS',
  description: 'Premier League - Match Day 25',
  startTime: new Date(now.getTime() - 25 * 60000), // Started 25 min ago
  isLive: true,
  currentScore: '0 - 0',
  participants: ['Liverpool', 'Arsenal'],
  markets: [...LIVE_MARKETS, ...UPCOMING_MARKETS],
};

// Legacy markets for reference
export const MOCK_MARKETS = LIVE_MARKETS;
