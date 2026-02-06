import type { LiveMatch, MatchEvent, MatchStatistics } from '@/types/soccer';

export class SoccerAPIClient {
  private apiKey: string;
  private baseURL = 'https://v3.football.api-sports.io';
  private requestCount = 0;
  private maxRequests = 100; // Free tier limit

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required. Please set NEXT_PUBLIC_APISPORTS_KEY in .env.local');
    }

    this.apiKey = apiKey;
    console.log('⚽ SoccerAPIClient initialized with API-Football Direct');
    console.log('   Base URL:', this.baseURL);
    console.log('   API Key:', apiKey.substring(0, 10) + '...');
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    if (this.requestCount >= this.maxRequests) {
      throw new Error('API request limit reached for today (100 requests)');
    }

    const url = `${this.baseURL}${endpoint}`;
    console.log(`📡 [API-Football Direct] Fetching: ${endpoint}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error(
            '401 Unauthorized: Invalid API key. Please check your NEXT_PUBLIC_APISPORTS_KEY in .env.local'
          );
        }
        
        if (response.status === 403) {
          throw new Error(
            '403 Forbidden: API key not activated or subscription expired. Please verify your account at https://dashboard.api-football.com/'
          );
        }

        if (response.status === 429) {
          throw new Error(
            '429 Too Many Requests: Daily limit reached (100 requests/day on free tier).'
          );
        }
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.requestCount++;
      
      // Log API usage from response headers
      const remaining = response.headers.get('x-ratelimit-requests-remaining');
      const limit = response.headers.get('x-ratelimit-requests-limit');
      
      console.log(`✅ Request successful`);
      console.log(`   Requests used: ${this.requestCount}`);
      console.log(`   Requests remaining today: ${remaining || 'unknown'}/${limit || '100'}`);

      return data;
    } catch (error) {
      console.error('❌ API fetch error:', error);
      throw error;
    }
  }

  async getLiveMatches(): Promise<LiveMatch[]> {
    try {
      const data = await this.fetch<{ response: LiveMatch[] }>('/fixtures?live=all');
      console.log(`⚽ Found ${data.response.length} live matches`);
      
      if (data.response.length === 0) {
        console.log('ℹ️ No live matches at the moment');
      }
      
      return data.response;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  async getMatchById(fixtureId: number): Promise<LiveMatch | null> {
    try {
      const data = await this.fetch<{ response: LiveMatch[] }>(`/fixtures?id=${fixtureId}`);
      
      if (!data.response || data.response.length === 0) {
        console.log(`⚠️ Match ${fixtureId} not found`);
        return null;
      }
      
      return data.response[0];
    } catch (error) {
      console.error(`Error fetching match ${fixtureId}:`, error);
      throw error;
    }
  }

  async getMatchEvents(fixtureId: number): Promise<MatchEvent[]> {
    try {
      const data = await this.fetch<{ response: MatchEvent[] }>(`/fixtures/events?fixture=${fixtureId}`);
      console.log(`📊 Found ${data.response?.length || 0} events for fixture ${fixtureId}`);
      return data.response || [];
    } catch (error) {
      console.error(`Error fetching events for fixture ${fixtureId}:`, error);
      throw error;
    }
  }

  async getMatchStatistics(fixtureId: number): Promise<MatchStatistics[]> {
    try {
      const data = await this.fetch<{ response: MatchStatistics[] }>(`/fixtures/statistics?fixture=${fixtureId}`);
      console.log(`📈 Found statistics for fixture ${fixtureId}`);
      return data.response || [];
    } catch (error) {
      console.error(`Error fetching statistics for fixture ${fixtureId}:`, error);
      throw error;
    }
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  getRemainingRequests(): number {
    return this.maxRequests - this.requestCount;
  }
}

// Singleton instance
let soccerAPIClientInstance: SoccerAPIClient | null = null;

export function getSoccerAPIClient(): SoccerAPIClient {
  if (!soccerAPIClientInstance) {
    const apiKey = process.env.NEXT_PUBLIC_APISPORTS_KEY;
    
    if (!apiKey) {
      throw new Error(
        'NEXT_PUBLIC_APISPORTS_KEY not found in environment variables. ' +
        'Please add it to your .env.local file. ' +
        'Get your API key from: https://dashboard.api-football.com/'
      );
    }
    
    soccerAPIClientInstance = new SoccerAPIClient(apiKey);
  }
  return soccerAPIClientInstance;
}
