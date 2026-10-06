export interface DatasetRecord {
  id: string;
  studentId: string;
  candidateId: string;
  studentName: string;
  candidateName: string;
  normalizedStudentName: string;
  normalizedCandidateName: string;
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
  label: 0 | 1;
  source: string;
  sourceId?: string;
  createdAt: string;
}
