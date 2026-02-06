import { getSoccerAPIClient } from './apiClient';
import type { LiveMatch, MatchEvent } from '@/types/soccer';
import type { Market } from '@/types/market';

export interface TrackedMatch {
  match: LiveMatch;
  lastUpdate: Date;
  events: MatchEvent[];
  activeMarkets: string[];
}

export class LiveMatchManager {
  private trackedMatches: Map<number, TrackedMatch> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private eventCallbacks: Map<string, (event: MatchEvent, match: LiveMatch) => void> = new Map();

  async startTracking(fixtureId: number) {
    console.log(`📍 Starting to track fixture ${fixtureId}`);
    
    const apiClient = getSoccerAPIClient();
    const match = await apiClient.getMatchById(fixtureId);
    
    if (!match) {
      throw new Error(`Match ${fixtureId} not found`);
    }

    const events = await apiClient.getMatchEvents(fixtureId);

    this.trackedMatches.set(fixtureId, {
      match,
      lastUpdate: new Date(),
      events,
      activeMarkets: [],
    });

    console.log(`✅ Now tracking: ${match.teams.home.name} vs ${match.teams.away.name}`);
    console.log(`   Score: ${match.goals.home} - ${match.goals.away}`);
    console.log(`   Status: ${match.fixture.status.long} (${match.fixture.status.elapsed}')`);

    // Start polling for updates
    this.startPolling();
  }

  private startPolling() {
    if (this.updateInterval) return;

    // Poll every 30 seconds (saves API requests)
    this.updateInterval = setInterval(() => {
      this.updateAllMatches();
    }, 30000);

    console.log('🔄 Started polling for match updates (every 30s)');
  }

  private async updateAllMatches() {
    const apiClient = getSoccerAPIClient();

    for (const [fixtureId, tracked] of this.trackedMatches) {
      try {
        const match = await apiClient.getMatchById(fixtureId);
        if (!match) continue;

        const events = await apiClient.getMatchEvents(fixtureId);

        // Check for new events
        const newEvents = events.filter(
          event => !tracked.events.some(
            e => e.time.elapsed === event.time.elapsed && e.type === event.type
          )
        );

        if (newEvents.length > 0) {
          console.log(`🚨 New events detected for fixture ${fixtureId}:`);
          newEvents.forEach(event => {
            console.log(`   ${event.time.elapsed}' - ${event.type}: ${event.detail}`);
            
            // Trigger callbacks
            this.eventCallbacks.forEach(callback => {
              callback(event, match);
            });
          });
        }

        // Update tracked match
        this.trackedMatches.set(fixtureId, {
          match,
          lastUpdate: new Date(),
          events,
          activeMarkets: tracked.activeMarkets,
        });

        console.log(`📊 Updated: ${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name} (${match.fixture.status.elapsed}')`);

      } catch (error) {
        console.error(`Error updating fixture ${fixtureId}:`, error);
      }
    }
  }

  stopTracking(fixtureId: number) {
    this.trackedMatches.delete(fixtureId);
    console.log(`🛑 Stopped tracking fixture ${fixtureId}`);

    if (this.trackedMatches.size === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🛑 Stopped polling (no more tracked matches)');
    }
  }

  getTrackedMatch(fixtureId: number): TrackedMatch | undefined {
    return this.trackedMatches.get(fixtureId);
  }

  getAllTrackedMatches(): TrackedMatch[] {
    return Array.from(this.trackedMatches.values());
  }

  onMatchEvent(id: string, callback: (event: MatchEvent, match: LiveMatch) => void) {
    this.eventCallbacks.set(id, callback);
  }

  offMatchEvent(id: string) {
    this.eventCallbacks.delete(id);
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.trackedMatches.clear();
    this.eventCallbacks.clear();
    console.log('🧹 Match manager cleaned up');
  }
}

// Singleton instance
let matchManagerInstance: LiveMatchManager | null = null;

export function getLiveMatchManager(): LiveMatchManager {
  if (!matchManagerInstance) {
    matchManagerInstance = new LiveMatchManager();
  }
  return matchManagerInstance;
}
