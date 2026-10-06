import { DatasetRecord } from '../types/dataset-record';

export interface SplitConfig {
  trainRatio: number;
  validationRatio: number;
  testRatio: number;
  randomSeed: number;
}

export interface DatasetSplit {
  train: DatasetRecord[];
  validation: DatasetRecord[];
  test: DatasetRecord[];
}

export class DatasetSplitter {
  private readonly config: SplitConfig;

  constructor(config?: Partial<SplitConfig>) {
    this.config = {
      trainRatio: config?.trainRatio ?? parseFloat(process.env.DATASET_TRAIN_RATIO || '0.70'),
      validationRatio: config?.validationRatio ?? parseFloat(process.env.DATASET_VALIDATION_RATIO || '0.15'),
      testRatio: config?.testRatio ?? parseFloat(process.env.DATASET_TEST_RATIO || '0.15'),
      randomSeed: config?.randomSeed ?? parseInt(process.env.DATASET_RANDOM_SEED || '42', 10),
    };

    const total = this.config.trainRatio + this.config.validationRatio + this.config.testRatio;
    if (Math.abs(total - 1.0) > 0.01) {
      throw new Error(`Split ratios must sum to 1.0, got ${total}`);
    }
  }

  /**
   * Split dataset preventing data leakage by grouping by studentId.
   * All pairs from the same student go into the same split.
   */
  split(records: DatasetRecord[]): DatasetSplit {
    // Group records by studentId to prevent data leakage
    const studentGroups = new Map<string, DatasetRecord[]>();

    for (const record of records) {
      const key = record.studentId;
      if (!studentGroups.has(key)) {
        studentGroups.set(key, []);
      }
      studentGroups.get(key)!.push(record);
    }

    // Shuffle student groups with seeded RNG
    const studentIds = Array.from(studentGroups.keys());
    this.seededShuffle(studentIds, this.config.randomSeed);

    const totalStudents = studentIds.length;
    const trainEnd = Math.floor(totalStudents * this.config.trainRatio);
    const validationEnd = trainEnd + Math.floor(totalStudents * this.config.validationRatio);

    const train: DatasetRecord[] = [];
    const validation: DatasetRecord[] = [];
    const test: DatasetRecord[] = [];

    for (let i = 0; i < studentIds.length; i++) {
      const studentRecords = studentGroups.get(studentIds[i])!;
      if (i < trainEnd) {
        train.push(...studentRecords);
      } else if (i < validationEnd) {
        validation.push(...studentRecords);
      } else {
        test.push(...studentRecords);
      }
    }

    return { train, validation, test };
  }

  getConfig(): SplitConfig {
    return { ...this.config };
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    let s = seed;
    const rng = () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
