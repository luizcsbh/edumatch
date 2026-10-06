import { levenshteinDistance, levenshteinSimilarity } from '../src/features/levenshtein';

describe('Levenshtein', () => {
  test('identical strings have distance 0', () => {
    expect(levenshteinDistance('JOAO', 'JOAO')).toBe(0);
  });

  test('empty strings have distance equal to other string length', () => {
    expect(levenshteinDistance('JOAO', '')).toBe(4);
    expect(levenshteinDistance('', 'JOAO')).toBe(4);
  });

  test('single character difference', () => {
    expect(levenshteinDistance('JOAO', 'JOAA')).toBe(1);
  });

  test('similarity returns 1.0 for identical strings', () => {
    expect(levenshteinSimilarity('JOAO PEDRO', 'JOAO PEDRO')).toBe(1.0);
  });

  test('similarity returns 0.0 for completely different', () => {
    expect(levenshteinSimilarity('', '')).toBe(1.0);
  });

  test('similarity between 0 and 1', () => {
    const result = levenshteinSimilarity('JOAO PEDRO SILVA', 'JOAO PEDRO DA SILVA');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
