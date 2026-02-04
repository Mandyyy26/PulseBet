import { YellowClient } from '@/lib/yellow/client';

describe('Yellow Network Integration', () => {
  let client: YellowClient;

  beforeEach(() => {
    client = new YellowClient(process.env.NEXT_PUBLIC_YELLOW_WS!);
  });

  test('should connect to sandbox', async () => {
    await expect(client.connect()).resolves.not.toThrow();
  }, 10000);

  test('should authenticate session', async () => {
    await client.connect();
    // Add auth assertion
  });

  afterEach(() => {
    client.disconnect();
  });
});
