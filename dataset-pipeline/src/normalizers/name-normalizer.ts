export class NameNormalizer {
  public normalize(name: string): string {
    if (!name) return '';

    // Convert to uppercase
    let normalized = name.trim().toUpperCase();

    // Replace hyphens and special punctuation with spaces
    normalized = normalized.replace(/[-_./\\,;:!?'"()[\]{}]/g, ' ');

    // Remove accents/diacritics
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove remaining special characters, keep only ASCII letters, numbers and spaces
    normalized = normalized.replace(/[^A-Z0-9\s]/g, ' ');

    // Normalize particles: DA, DE, DO, DOS, DAS
    // In PT-BR names, particles are often kept uppercase or standardized
    // The requirement says:
    // "João Pedro da Silva" -> "JOAO PEDRO DA SILVA"
    // "JOAO PEDRO DA SILVA" -> "JOAO PEDRO DA SILVA"
    // So particles should remain as normalized tokens DA, DE, DO, DOS, DAS
    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);

    return tokens.join(' ').trim();
  }
}

export function normalizeName(name: string): string {
  const normalizer = new NameNormalizer();
  return normalizer.normalize(name);
}
