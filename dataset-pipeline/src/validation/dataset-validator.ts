import { DatasetRecord } from '../types/dataset-record';

export interface ValidationResult {
  valid: boolean;
  totalRecords: number;
  positive: number;
  negative: number;
  hardNegative: number;
  duplicates: number;
  nullFeatures: number;
  invalidFeatures: number;
  invalidLabels: number;
  emptyNames: number;
  dataLeakage: number;
  errors: string[];
  warnings: string[];
}

export interface QualityReport {
  version: string;
  totalRecords: number;
  positive: number;
  negative: number;
  hardNegative: number;
  train: number;
  validation: number;
  test: number;
  duplicates: number;
  nullFeatures: number;
  invalidFeatures: number;
  dataLeakage: number;
  quality: 'PASS' | 'FAIL';
  errors: string[];
}

export class DatasetValidator {
  private readonly SIMILARITY_FEATURES = [
    'jaroWinkler',
    'levenshteinSimilarity',
    'tokenSimilarity',
    'firstNameSimilarity',
    'lastNameSimilarity',
    'tokenOrderSimilarity',
    'fullNameSimilarity',
  ] as const;

  private readonly BOOLEAN_FEATURES = [
    'sameFirstName',
    'sameLastName',
    'sameInitials',
  ] as const;

  validate(records: DatasetRecord[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let duplicates = 0;
    let nullFeatures = 0;
    let invalidFeatures = 0;
    let invalidLabels = 0;
    let emptyNames = 0;
    let dataLeakage = 0;

    const seen = new Set<string>();
    const positive = records.filter((r) => r.label === 1).length;
    const negative = records.filter((r) => r.label === 0 && r.source !== 'hard_negative').length;
    const hardNegative = records.filter((r) => r.label === 0 && r.source === 'hard_negative').length;

    for (const record of records) {
      // Check duplicates
      const key = `${record.normalizedStudentName}|${record.normalizedCandidateName}`;
      if (seen.has(key)) {
        duplicates++;
      }
      seen.add(key);

      // Check empty names
      if (!record.studentName || !record.candidateName || !record.normalizedStudentName || !record.normalizedCandidateName) {
        emptyNames++;
      }

      // Check invalid labels
      if (record.label !== 0 && record.label !== 1) {
        invalidLabels++;
      }

      // Check similarity features in range [0, 1]
      for (const feat of this.SIMILARITY_FEATURES) {
        const val = record[feat];
        if (val === null || val === undefined) {
          nullFeatures++;
        } else if (val < 0 || val > 1) {
          invalidFeatures++;
        }
      }

      // Check boolean features are 0 or 1
      for (const feat of this.BOOLEAN_FEATURES) {
        const val = record[feat];
        if (val === null || val === undefined) {
          nullFeatures++;
        } else if (val !== 0 && val !== 1) {
          invalidFeatures++;
        }
      }

      // tokenCountDifference should be >= 0
      if (record.tokenCountDifference === null || record.tokenCountDifference === undefined) {
        nullFeatures++;
      } else if (record.tokenCountDifference < 0) {
        invalidFeatures++;
      }
    }

    // Check balance
    if (positive === 0) {
      errors.push('No positive examples found');
    }
    if (negative === 0 && hardNegative === 0) {
      errors.push('No negative examples found');
    }
    if (hardNegative === 0) {
      warnings.push('No hard negative examples found');
    }

    const ratio = positive > 0 ? (negative + hardNegative) / positive : 0;
    if (ratio > 5 || ratio < 0.2) {
      warnings.push(`Class imbalance detected: positive=${positive}, negative=${negative + hardNegative}, ratio=${ratio.toFixed(2)}`);
    }

    if (duplicates > 0) errors.push(`Found ${duplicates} duplicate records`);
    if (nullFeatures > 0) errors.push(`Found ${nullFeatures} null features`);
    if (invalidFeatures > 0) errors.push(`Found ${invalidFeatures} invalid features`);
    if (invalidLabels > 0) errors.push(`Found ${invalidLabels} invalid labels`);
    if (emptyNames > 0) errors.push(`Found ${emptyNames} records with empty names`);

    const valid = errors.length === 0;

    return {
      valid,
      totalRecords: records.length,
      positive,
      negative,
      hardNegative,
      duplicates,
      nullFeatures,
      invalidFeatures,
      invalidLabels,
      emptyNames,
      dataLeakage,
      errors,
      warnings,
    };
  }

  checkDataLeakage(
    train: DatasetRecord[],
    validation: DatasetRecord[],
    test: DatasetRecord[],
  ): number {
    let leakage = 0;

    const trainStudentIds = new Set(train.map((r) => r.studentId));
    const trainCandidateIds = new Set(train.map((r) => r.candidateId));

    for (const record of [...validation, ...test]) {
      if (trainStudentIds.has(record.studentId) || trainCandidateIds.has(record.candidateId)) {
        leakage++;
      }
    }

    return leakage;
  }

  generateQualityReport(
    version: string,
    records: DatasetRecord[],
    train: DatasetRecord[],
    validation: DatasetRecord[],
    test: DatasetRecord[],
  ): QualityReport {
    const result = this.validate(records);
    const leakage = this.checkDataLeakage(train, validation, test);

    const allErrors = [...result.errors];
    if (leakage > 0) {
      allErrors.push(`Data leakage detected: ${leakage} records`);
    }

    const quality = allErrors.length === 0 ? 'PASS' : 'FAIL';

    return {
      version,
      totalRecords: result.totalRecords,
      positive: result.positive,
      negative: result.negative,
      hardNegative: result.hardNegative,
      train: train.length,
      validation: validation.length,
      test: test.length,
      duplicates: result.duplicates,
      nullFeatures: result.nullFeatures,
      invalidFeatures: result.invalidFeatures,
      dataLeakage: leakage,
      quality,
      errors: allErrors,
    };
  }

  printQualityReport(report: QualityReport): string {
    const lines = [
      'DATASET QUALITY REPORT',
      '',
      `Version: ${report.version}`,
      '',
      `Total records: ${report.totalRecords}`,
      '',
      `Positive: ${report.positive}`,
      `Negative: ${report.negative}`,
      `Hard Negative: ${report.hardNegative}`,
      '',
      `Train: ${report.train}`,
      `Validation: ${report.validation}`,
      `Test: ${report.test}`,
      '',
      `Duplicates: ${report.duplicates}`,
      `Null features: ${report.nullFeatures}`,
      `Invalid features: ${report.invalidFeatures}`,
      `Data leakage: ${report.dataLeakage}`,
      '',
      `Quality: ${report.quality}`,
    ];

    if (report.errors.length > 0) {
      lines.push('', 'Errors:');
      report.errors.forEach((e) => lines.push(`  - ${e}`));
    }

    return lines.join('\n');
  }
}
