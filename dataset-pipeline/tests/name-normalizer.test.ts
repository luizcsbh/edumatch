import { NameNormalizer } from '../src/normalizers/name-normalizer';

describe('NameNormalizer', () => {
  const normalizer = new NameNormalizer();

  test('should convert to uppercase', () => {
    expect(normalizer.normalize('joao pedro')).toBe('JOAO PEDRO');
  });

  test('should remove accents', () => {
    expect(normalizer.normalize('JOÃO PEDRO')).toBe('JOAO PEDRO');
    expect(normalizer.normalize('José María')).toBe('JOSE MARIA');
  });

  test('should remove extra spaces', () => {
    expect(normalizer.normalize('JOAO  PEDRO   DA   SILVA')).toBe('JOAO PEDRO DA SILVA');
  });

  test('should normalize names with particles', () => {
    const result = normalizer.normalize('João Pedro da Silva');
    expect(result).toBe('JOAO PEDRO DA SILVA');
  });

  test('should handle special characters', () => {
    expect(normalizer.normalize("MARIA D'AJUDA")).toBe('MARIA DAJUDA');
  });

  test('should handle compound names', () => {
    expect(normalizer.normalize('Ana-Maria Souza')).toBe('ANA MARIA SOUZA');
  });

  test('should produce same result for equivalent names', () => {
    const name1 = normalizer.normalize('João  Pedro da Silva');
    const name2 = normalizer.normalize('JOAO PEDRO DA SILVA');
    expect(name1).toBe(name2);
  });

  test('should handle empty input', () => {
    expect(normalizer.normalize('')).toBe('');
  });

  test('should handle names with numbers', () => {
    expect(normalizer.normalize('MARIA 2ª TURMA')).toBe('MARIA 2 TURMA');
  });

  test('should preserve particles DA, DE, DO, DOS, DAS', () => {
    expect(normalizer.normalize('Maria de Souza')).toBe('MARIA DE SOUZA');
    expect(normalizer.normalize('João dos Santos')).toBe('JOAO DOS SANTOS');
  });
});
