export function calculateTokenSimilarity(s1: string, s2: string): number {
  if (!s1 && !s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const tokens1 = new Set(s1.split(/\s+/).filter(t => t.length > 0));
  const tokens2 = new Set(s2.split(/\s+/).filter(t => t.length > 0));

  if (tokens1.size === 0 && tokens2.size === 0) return 1.0;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }

  const union = tokens1.size + tokens2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function calculateTokenOrderSimilarity(s1: string, s2: string): number {
  const tokens1 = s1.split(/\s+/).filter(t => t.length > 0);
  const tokens2 = s2.split(/\s+/).filter(t => t.length > 0);

  if (tokens1.length === 0 || tokens2.length === 0) return 0.0;

  let inOrderCount = 0;
  let t2Idx = 0;

  for (let i = 0; i < tokens1.length; i++) {
    for (let j = t2Idx; j < tokens2.length; j++) {
      if (tokens1[i] === tokens2[j]) {
        inOrderCount++;
        t2Idx = j + 1;
        break;
      }
    }
  }

  return inOrderCount / Math.max(tokens1.length, tokens2.length);
}
