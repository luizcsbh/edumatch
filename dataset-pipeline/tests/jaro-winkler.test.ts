import { jaroWinkler } from '../src/features/jaro-winkler';

describe('Jaro-Winkler', () => {
  test('identical strings return 1.0', () => {
    expect(jaroWinkler('JOAO', 'JOAO')).toBe(1.0);
  });

  test('completely different strings return low score', () => {
    expect(jaroWinkler('ABC', 'XYZ')).toBeLessThan(0.5);
  });

  test('similar strings return high score', () => {
    expect(jaroWinkler('JOAO PEDRO', 'JOAO PEDRO')).toBe(1.0);
    expect(jaroWinkler('JOAO PEDRO SILVA', 'JOAO PEDRO DA SILVA')).toBeGreaterThan(0.85);
  });

  test('empty strings', () => {
    expect(jaroWinkler('', '')).toBe(1.0);
    expect(jaroWinkler('JOAO', '')).toBe(0.0);
    expect(jaroWinkler('', 'JOAO')).toBe(0.0);
  });

  test('returns value between 0 and 1', () => {
    const result = jaroWinkler('MARIA EDUARDA SOUZA', 'MARIA EDUARDA DE SOUZA');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});
