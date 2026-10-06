export class NameNormalizer {
  public normalize(name: string): string {
    if (!name) return '';

    let normalized = name.trim().toUpperCase();
    normalized = normalized.replace(/[-_./\\,;:!?'"()[\]{}]/g, ' ');
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    normalized = normalized.replace(/[^A-Z0-9\s]/g, ' ');

    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);
    return tokens.join(' ').trim();
  }
}
