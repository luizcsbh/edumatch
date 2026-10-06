import { Student } from '../types/student';
import { SisuCandidate } from '../types/sisu-candidate';
import { RawPair } from '../features/feature-generator';
import { CandidatePair } from '../blocking/candidate-blocking';
import { jaroWinkler } from '../features/jaro-winkler';

export class HardNegativeGenerator {
  public generate(
    students: Student[],
    candidates: SisuCandidate[],
    blocks: Map<string, CandidatePair[]>,
    limit: number = 2000
  ): RawPair[] {
    const pairs: RawPair[] = [];
    const used = new Set<string>();

    for (const [candId, candidatePairs] of blocks.entries()) {
      if (pairs.length >= limit) break;

      for (const cp of candidatePairs) {
        if (pairs.length >= limit) break;

        const sNorm = cp.student.normalizedName;
        const cNorm = cp.candidate.normalizedName;

        if (!sNorm || !cNorm || sNorm === cNorm) continue;

        const key = `${cp.student.id}_${cp.candidate.id}`;
        if (used.has(key)) continue;

        // Hard negative: High similarity (same first name or Jaro-Winkler >= 0.75) but different person
        const jw = jaroWinkler(sNorm, cNorm);
        if (jw >= 0.72 && jw < 0.98) {
          used.add(key);
          pairs.push({
            student: cp.student,
            candidate: cp.candidate,
            label: 0,
            source: 'hard_negative',
          });
        }
      }
    }

    return pairs;
  }
}
