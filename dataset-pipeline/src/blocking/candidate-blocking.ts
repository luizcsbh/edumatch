import { Student } from '../types/student';
import { SisuCandidate } from '../types/sisu-candidate';

export interface CandidatePair {
  student: Student;
  candidate: SisuCandidate;
}

export class CandidateBlocking {
  private blocksByFirstLetter = new Map<string, Student[]>();
  private blocksByFirstName = new Map<string, Student[]>();
  private blocksByLastName = new Map<string, Student[]>();

  public generateBlocks(students: Student[], candidates: SisuCandidate[]): Map<string, CandidatePair[]> {
    this.indexStudents(students);
    const resultBlocks = new Map<string, CandidatePair[]>();

    for (const candidate of candidates) {
      const matchedStudents = this.getCandidatesForCandidate(candidate);
      const key = candidate.id;
      const pairs: CandidatePair[] = matchedStudents.map((s) => ({
        student: s,
        candidate,
      }));
      resultBlocks.set(key, pairs);
    }

    return resultBlocks;
  }

  public indexStudents(students: Student[]): void {
    this.blocksByFirstLetter.clear();
    this.blocksByFirstName.clear();
    this.blocksByLastName.clear();

    for (const student of students) {
      const name = student.normalizedName;
      if (!name) continue;

      const tokens = name.split(/\s+/).filter((t) => t.length > 0);
      if (tokens.length === 0) continue;

      const firstLetter = tokens[0][0];
      const firstName = tokens[0];
      const lastName = tokens[tokens.length - 1];

      this.addToMap(this.blocksByFirstLetter, firstLetter, student);
      this.addToMap(this.blocksByFirstName, firstName, student);
      this.addToMap(this.blocksByLastName, lastName, student);
    }
  }

  public getCandidatesForCandidate(candidate: SisuCandidate): Student[] {
    const name = candidate.normalizedName;
    if (!name) return [];

    const tokens = name.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return [];

    const firstName = tokens[0];
    const lastName = tokens[tokens.length - 1];

    const studentMap = new Map<string, Student>();

    const byFirst = this.blocksByFirstName.get(firstName) || [];
    for (const s of byFirst) {
      studentMap.set(s.id, s);
    }

    const byLast = this.blocksByLastName.get(lastName) || [];
    for (const s of byLast) {
      studentMap.set(s.id, s);
    }

    return Array.from(studentMap.values());
  }

  private addToMap(map: Map<string, Student[]>, key: string, item: Student): void {
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(item);
  }
}
