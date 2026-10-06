import { FeatureGenerator } from '../src/features/feature-generator';

describe('FeatureGenerator', () => {
  const generator = new FeatureGenerator();

  test('calculates all 11 features within valid boundaries', () => {
    const pair = {
      student: {
        id: 's-1',
        name: 'JOAO PEDRO DA SILVA',
        normalizedName: 'JOAO PEDRO DA SILVA',
        source: 'chromos',
      },
      candidate: {
        id: 'c-1',
        name: 'JOAO PEDRO SILVA',
        normalizedName: 'JOAO PEDRO SILVA',
      },
      label: 1 as const,
      source: 'test',
    };

    const record = generator.generate(pair);

    expect(record.id).toBe('s-1_c-1');
    expect(record.jaroWinkler).toBeGreaterThanOrEqual(0);
    expect(record.jaroWinkler).toBeLessThanOrEqual(1);
    expect(record.levenshteinSimilarity).toBeGreaterThanOrEqual(0);
    expect(record.levenshteinSimilarity).toBeLessThanOrEqual(1);
    expect(record.tokenSimilarity).toBeGreaterThanOrEqual(0);
    expect(record.tokenSimilarity).toBeLessThanOrEqual(1);
    expect(record.sameFirstName).toBe(1);
    expect(record.sameLastName).toBe(1);
    expect(record.firstNameSimilarity).toBe(1);
    expect(record.lastNameSimilarity).toBe(1);
    expect(record.tokenCountDifference).toBeGreaterThanOrEqual(0);
    expect(record.label).toBe(1);
  });
});
