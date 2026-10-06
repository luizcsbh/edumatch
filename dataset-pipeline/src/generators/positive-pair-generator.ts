import { Student } from '../types/student';
import { SisuCandidate } from '../types/sisu-candidate';
import { RawPair } from '../features/feature-generator';

export class PositivePairGenerator {
  public generate(students: Student[], candidates: SisuCandidate[]): RawPair[] {
    const pairs: RawPair[] = [];
    const studentMap = new Map<string, Student>();

    for (const student of students) {
      if (student.normalizedName) {
        studentMap.set(student.normalizedName, student);
      }
    }

    for (const candidate of candidates) {
      if (!candidate.normalizedName) continue;

      const exactStudent = studentMap.get(candidate.normalizedName);
      if (exactStudent) {
        pairs.push({
          student: exactStudent,
          candidate,
          label: 1,
          source: 'exact_name_match',
        });
      }
    }

    return pairs;
  }
}
