import { calculateTokenSimilarity, calculateTokenOrderSimilarity } from '../src/features/token-similarity';

describe('Token Similarity', () => {
  test('identical tokens return 1.0', () => {
    expect(calculateTokenSimilarity('JOAO SILVA', 'JOAO SILVA')).toBe(1.0);
  });

  test('disjoint tokens return 0.0', () => {
    expect(calculateTokenSimilarity('JOAO SILVA', 'MARIA SOUZA')).toBe(0.0);
  });

  test('partial overlap', () => {
    const sim = calculateTokenSimilarity('JOAO PEDRO SILVA', 'JOAO SILVA');
    expect(sim).toBeGreaterThan(0.5);
    expect(sim).toBeLessThan(1.0);
  });

  test('token order similarity', () => {
    expect(calculateTokenOrderSimilarity('JOAO PEDRO SILVA', 'JOAO PEDRO SILVA')).toBe(1.0);
    expect(calculateTokenOrderSimilarity('SILVA JOAO PEDRO', 'JOAO PEDRO SILVA')).toBeLessThan(1.0);
  });
});
