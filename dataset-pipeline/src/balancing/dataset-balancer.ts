import { DatasetRecord } from '../types/dataset-record';

export interface BalanceReport {
  totalRecords: number;
  positive: number;
  negative: number;
  hardNegative: number;
  positivePercentage: number;
  negativePercentage: number;
  hardNegativePercentage: number;
  strategy: string;
  recordsAfterBalancing: number;
}

export class DatasetBalancer {
  /**
   * Balance the dataset using undersampling of the majority class.
   */
  undersample(records: DatasetRecord[], seed: number = 42): DatasetRecord[] {
    const positive = records.filter((r) => r.label === 1);
    const negative = records.filter((r) => r.label === 0);

    const minCount = Math.min(positive.length, negative.length);

    const shuffledPositive = this.seededShuffle([...positive], seed);
    const shuffledNegative = this.seededShuffle([...negative], seed + 1);

    return [
      ...shuffledPositive.slice(0, minCount),
      ...shuffledNegative.slice(0, minCount),
    ];
  }

  /**
   * Balance the dataset using oversampling of the minority class.
   */
  oversample(records: DatasetRecord[], seed: number = 42): DatasetRecord[] {
    const positive = records.filter((r) => r.label === 1);
    const negative = records.filter((r) => r.label === 0);

    const maxCount = Math.max(positive.length, negative.length);

    const oversampledPositive = this.oversampleArray(positive, maxCount, seed);
    const oversampledNegative = this.oversampleArray(negative, maxCount, seed + 1);

    return [...oversampledPositive, ...oversampledNegative];
  }

  /**
   * Auto-balance using the best strategy based on dataset size.
   */
  autoBalance(records: DatasetRecord[], seed: number = 42): { records: DatasetRecord[]; strategy: string } {
    const positive = records.filter((r) => r.label === 1).length;
    const negative = records.filter((r) => r.label === 0).length;

    const ratio = Math.max(positive, negative) / Math.max(Math.min(positive, negative), 1);

    if (ratio <= 1.5) {
      return { records, strategy: 'none' };
    }

    const total = records.length;
    if (total > 10000) {
      return { records: this.undersample(records, seed), strategy: 'undersampling' };
    } else {
      return { records: this.oversample(records, seed), strategy: 'oversampling' };
    }
  }

  generateReport(records: DatasetRecord[], strategy: string): BalanceReport {
    const positive = records.filter((r) => r.label === 1).length;
    const negative = records.filter((r) => r.label === 0 && r.source !== 'hard_negative').length;
    const hardNegative = records.filter((r) => r.label === 0 && r.source === 'hard_negative').length;
    const total = records.length;

    return {
      totalRecords: total,
      positive,
      negative,
      hardNegative,
      positivePercentage: total > 0 ? (positive / total) * 100 : 0,
      negativePercentage: total > 0 ? (negative / total) * 100 : 0,
      hardNegativePercentage: total > 0 ? (hardNegative / total) * 100 : 0,
      strategy,
      recordsAfterBalancing: total,
    };
  }

  private oversampleArray(arr: DatasetRecord[], targetCount: number, seed: number): DatasetRecord[] {
    if (arr.length === 0) return [];
    const result: DatasetRecord[] = [...arr];
    let rng = this.createRng(seed);

    while (result.length < targetCount) {
      const idx = Math.floor(rng() * arr.length);
      result.push({ ...arr[idx], id: `${arr[idx].id}-oversample-${result.length}` });
      rng = this.advanceRng(rng);
    }

    return result;
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    let rng = this.createRng(seed);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
      rng = this.advanceRng(rng);
    }
    return arr;
  }

  private createRng(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
  }

  private advanceRng(rng: () => number): () => number {
    rng();
    return rng;
  }
}
