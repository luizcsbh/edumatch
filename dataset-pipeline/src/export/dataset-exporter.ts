import * as fs from 'fs';
import * as path from 'path';
import { DatasetRecord } from '../types/dataset-record';

export interface DatasetManifest {
  version: string;
  records: number;
  positive: number;
  negative: number;
  hard_negative: number;
  train: number;
  validation: number;
  test: number;
  random_seed: number;
  feature_version: string;
  source_versions: string[];
  created_at: string;
}

export class DatasetExporter {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  exportCSV(records: DatasetRecord[], filePath: string): void {
    const headers = [
      'id', 'student_id', 'candidate_id', 'student_name', 'candidate_name',
      'normalized_student_name', 'normalized_candidate_name',
      'jaro_winkler', 'levenshtein_similarity', 'token_similarity',
      'same_first_name', 'same_last_name', 'first_name_similarity', 'last_name_similarity',
      'same_initials', 'token_count_difference', 'token_order_similarity',
      'full_name_similarity', 'label', 'source', 'created_at',
    ];

    const rows = records.map((r) => [
      r.id, r.studentId, r.candidateId,
      `"${r.studentName}"`, `"${r.candidateName}"`,
      `"${r.normalizedStudentName}"`, `"${r.normalizedCandidateName}"`,
      r.jaroWinkler.toFixed(6), r.levenshteinSimilarity.toFixed(6),
      r.tokenSimilarity.toFixed(6), r.sameFirstName, r.sameLastName,
      r.firstNameSimilarity.toFixed(6), r.lastNameSimilarity.toFixed(6),
      r.sameInitials, r.tokenCountDifference,
      r.tokenOrderSimilarity.toFixed(6), r.fullNameSimilarity.toFixed(6),
      r.label, r.source, r.createdAt,
    ].join(','));

    const content = [headers.join(','), ...rows].join('\n');
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  exportJSON(records: DatasetRecord[], filePath: string): void {
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  exportManifest(manifest: DatasetManifest, filePath: string): void {
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  exportAll(
    version: string,
    train: DatasetRecord[],
    validation: DatasetRecord[],
    test: DatasetRecord[],
    allRecords: DatasetRecord[],
    randomSeed: number,
    featureVersion: string = '1.0.0',
    sourceVersions: string[] = ['chromos-2026', 'sisu-2026-8a-chamada'],
  ): DatasetManifest {
    const trainDir = path.join(this.baseDir, 'datasets', 'train');
    const validationDir = path.join(this.baseDir, 'datasets', 'validation');
    const testDir = path.join(this.baseDir, 'datasets', 'test');
    const processedDir = path.join(this.baseDir, 'datasets', 'processed');
    const manifestsDir = path.join(this.baseDir, 'manifests');

    // Export split datasets
    this.exportCSV(train, path.join(trainDir, `dataset-v${version}-train.csv`));
    this.exportCSV(validation, path.join(validationDir, `dataset-v${version}-validation.csv`));
    this.exportCSV(test, path.join(testDir, `dataset-v${version}-test.csv`));

    // Export full dataset
    this.exportCSV(allRecords, path.join(processedDir, `dataset-v${version}.csv`));
    this.exportJSON(allRecords, path.join(processedDir, `dataset-v${version}.json`));

    // Create manifest
    const positive = allRecords.filter((r) => r.label === 1).length;
    const negative = allRecords.filter((r) => r.label === 0 && r.source !== 'hard_negative').length;
    const hardNegative = allRecords.filter((r) => r.label === 0 && r.source === 'hard_negative').length;

    const manifest: DatasetManifest = {
      version,
      records: allRecords.length,
      positive,
      negative,
      hard_negative: hardNegative,
      train: train.length,
      validation: validation.length,
      test: test.length,
      random_seed: randomSeed,
      feature_version: featureVersion,
      source_versions: sourceVersions,
      created_at: new Date().toISOString(),
    };

    this.exportManifest(manifest, path.join(manifestsDir, `dataset-v${version}.manifest.json`));

    return manifest;
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
