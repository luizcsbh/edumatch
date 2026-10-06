import { jaroWinkler } from './jaro-winkler';
import { levenshteinSimilarity } from './levenshtein';
import { calculateTokenSimilarity, calculateTokenOrderSimilarity } from './token-similarity';
import { NameNormalizer } from '../normalizers/name-normalizer';

export interface CalculatedFeatures {
  jaroWinkler: number;
  levenshteinSimilarity: number;
  tokenSimilarity: number;
  sameFirstName: number;
  sameLastName: number;
  firstNameSimilarity: number;
  lastNameSimilarity: number;
  sameInitials: number;
  tokenCountDifference: number;
  tokenOrderSimilarity: number;
  fullNameSimilarity: number;
}

export class FeatureCalculator {
  private normalizer = new NameNormalizer();

  public calculate(studentName: string, candidateName: string): CalculatedFeatures {
    const normS = this.normalizer.normalize(studentName);
    const normC = this.normalizer.normalize(candidateName);

    const tokensS = normS.split(/\s+/).filter(t => t.length > 0);
    const tokensC = normC.split(/\s+/).filter(t => t.length > 0);

    const firstS = tokensS.length > 0 ? tokensS[0] : '';
    const firstC = tokensC.length > 0 ? tokensC[0] : '';

    const lastS = tokensS.length > 1 ? tokensS[tokensS.length - 1] : (tokensS.length === 1 ? tokensS[0] : '');
    const lastC = tokensC.length > 1 ? tokensC[tokensC.length - 1] : (tokensC.length === 1 ? tokensC[0] : '');

    const initialsS = tokensS.map(t => t[0]).join('');
    const initialsC = tokensC.map(t => t[0]).join('');

    const jw = jaroWinkler(normS, normC);
    const levSim = levenshteinSimilarity(normS, normC);
    const tokSim = calculateTokenSimilarity(normS, normC);
    const sameFirst = firstS === firstC && firstS.length > 0 ? 1 : 0;
    const sameLast = lastS === lastC && lastS.length > 0 ? 1 : 0;
    const firstSim = jaroWinkler(firstS, firstC);
    const lastSim = jaroWinkler(lastS, lastC);
    const sameInit = initialsS === initialsC && initialsS.length > 0 ? 1 : 0;
    const tokCountDiff = Math.abs(tokensS.length - tokensC.length);
    const tokOrderSim = calculateTokenOrderSimilarity(normS, normC);
    const fullSim = jaroWinkler(normS.replace(/\s+/g, ''), normC.replace(/\s+/g, ''));

    return {
      jaroWinkler: Number(jw.toFixed(6)),
      levenshteinSimilarity: Number(levSim.toFixed(6)),
      tokenSimilarity: Number(tokSim.toFixed(6)),
      sameFirstName: sameFirst,
      sameLastName: sameLast,
      firstNameSimilarity: Number(firstSim.toFixed(6)),
      lastNameSimilarity: Number(lastSim.toFixed(6)),
      sameInitials: sameInit,
      tokenCountDifference: tokCountDiff,
      tokenOrderSimilarity: Number(tokOrderSim.toFixed(6)),
      fullNameSimilarity: Number(fullSim.toFixed(6)),
    };
  }

  public toFeatureArray(features: CalculatedFeatures): number[] {
    return [
      features.jaroWinkler,
      features.levenshteinSimilarity,
      features.tokenSimilarity,
      features.sameFirstName,
      features.sameLastName,
      features.firstNameSimilarity,
      features.lastNameSimilarity,
      features.sameInitials,
      features.tokenCountDifference,
      features.tokenOrderSimilarity,
      features.fullNameSimilarity,
    ];
  }
}
