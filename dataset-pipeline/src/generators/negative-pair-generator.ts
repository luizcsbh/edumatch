import { Student } from '../types/student';
import { SisuCandidate } from '../types/sisu-candidate';
import { RawPair } from '../features/feature-generator';
import { CandidatePair } from '../blocking/candidate-blocking';

export class NegativePairGenerator {
  public generate(
    students: Student[],
    candidates: SisuCandidate[],
    blocks: Map<string, CandidatePair[]>,
    limit: number = 2000
  ): RawPair[] {
    const pairs: RawPair[] = [];
    const used = new Set<string>();

    // Select candidates and match with distinct students randomly/semi-randomly
    const candidateList = [...candidates];
    let attempts = 0;
    const maxAttempts = limit * 15;

    while (pairs.length < limit && attempts < maxAttempts) {
      attempts++;
      const randCand = candidateList[Math.floor(Math.random() * candidateList.length)];
      const randStudent = students[Math.floor(Math.random() * students.length)];

      if (!randCand?.normalizedName || !randStudent?.normalizedName) continue;
      if (randCand.normalizedName === randStudent.normalizedName) continue;

      const key = `${randStudent.id}_${randCand.id}`;
      if (used.has(key)) continue;
      used.add(key);

      pairs.push({
        student: randStudent,
        candidate: randCand,
        label: 0,
        source: 'negative_random',
      });
    }

    return pairs;
  }
}
