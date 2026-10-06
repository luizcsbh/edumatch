import { FeatureCalculator } from '../src/features/feature-calculator';

describe('FeatureCalculator (ML Service)', () => {
  const calc = new FeatureCalculator();

  test('calculates correct feature vector', () => {
    const features = calc.calculate('JOAO PEDRO DA SILVA', 'JOAO PEDRO SILVA');
    expect(features.jaroWinkler).toBeGreaterThan(0.9);
    expect(features.sameFirstName).toBe(1);
    expect(features.sameLastName).toBe(1);

    const arr = calc.toFeatureArray(features);
    expect(arr.length).toBe(11);
    expect(arr[0]).toBe(features.jaroWinkler);
  });
});
