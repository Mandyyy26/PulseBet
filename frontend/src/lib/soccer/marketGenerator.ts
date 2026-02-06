import type { Market } from '@/types/market';
import type { LiveMatch } from '@/types/soccer';
import { getLiveMatchManager } from './matchManager';

export class SoccerMarketGenerator {
  generateNextGoalMarket(match: LiveMatch, durationMinutes: number = 10): Market {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const currentMinute = match.fixture.status.elapsed || 0;

    return {
      id: `goal-${match.fixture.id}-${Date.now()}`,
      question: `Will there be a goal in the next ${durationMinutes} minutes?`,
      description: `${homeTeam} vs ${awayTeam} - Current score: ${match.goals.home}-${match.goals.away}. Match minute: ${currentMinute}'. Market resolves YES if either team scores.`,
      category: match.league.name,
      eventType: 'SPORTS',
      icon: '⚽',
      startTime: now,
      endTime,
      duration: durationMinutes,
      totalVolume: 0,
      yesOdds: 45,
      noOdds: 55,
      status: 'LIVE',
      isLive: true,
      autoResolve: true,
      betCount: 0,
    };
  }

  generateCornerMarket(match: LiveMatch, durationMinutes: number = 5): Market {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const currentMinute = match.fixture.status.elapsed || 0;

    return {
      id: `corner-${match.fixture.id}-${Date.now()}`,
      question: `Corner kick in the next ${durationMinutes} minutes?`,
      description: `${homeTeam} vs ${awayTeam} - Match minute: ${currentMinute}'. Market resolves YES if there is a corner kick.`,
      category: match.league.name,
      eventType: 'SPORTS',
      icon: '⛳',
      startTime: now,
      endTime,
      duration: durationMinutes,
      totalVolume: 0,
      yesOdds: 60,
      noOdds: 40,
      status: 'LIVE',
      isLive: true,
      autoResolve: true,
      betCount: 0,
    };
  }

  generateCardMarket(match: LiveMatch, durationMinutes: number = 10): Market {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const currentMinute = match.fixture.status.elapsed || 0;

    return {
      id: `card-${match.fixture.id}-${Date.now()}`,
      question: `Yellow or red card in next ${durationMinutes} minutes?`,
      description: `${homeTeam} vs ${awayTeam} - Match minute: ${currentMinute}'. Market resolves YES if any player receives a card.`,
      category: match.league.name,
      eventType: 'SPORTS',
      icon: '🟨',
      startTime: now,
      endTime,
      duration: durationMinutes,
      totalVolume: 0,
      yesOdds: 40,
      noOdds: 60,
      status: 'LIVE',
      isLive: true,
      autoResolve: true,
      betCount: 0,
    };
  }

  generateTeamToScoreMarket(match: LiveMatch, durationMinutes: number = 15): Market {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    const homeTeam = match.teams.home.name;
    const awayTeam = match.teams.away.name;
    const currentMinute = match.fixture.status.elapsed || 0;

    return {
      id: `team-goal-${match.fixture.id}-${Date.now()}`,
      question: `Will ${homeTeam} score next?`,
      description: `${homeTeam} vs ${awayTeam} - Match minute: ${currentMinute}'. Market resolves YES if ${homeTeam} scores next, NO if ${awayTeam} scores.`,
      category: match.league.name,
      eventType: 'SPORTS',
      icon: '⚽',
      startTime: now,
      endTime,
      duration: durationMinutes,
      totalVolume: 0,
      yesOdds: 50,
      noOdds: 50,
      status: 'LIVE',
      isLive: true,
      autoResolve: true,
      betCount: 0,
    };
  }
}

let marketGeneratorInstance: SoccerMarketGenerator | null = null;

export function getSoccerMarketGenerator(): SoccerMarketGenerator {
  if (!marketGeneratorInstance) {
    marketGeneratorInstance = new SoccerMarketGenerator();
  }
  return marketGeneratorInstance;
}
