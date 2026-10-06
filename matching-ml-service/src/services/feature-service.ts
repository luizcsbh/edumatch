import { FeatureCalculator, CalculatedFeatures } from '../features/feature-calculator';

export class FeatureService {
  private calculator = new FeatureCalculator();

  public getFeatures(studentName: string, candidateName: string): CalculatedFeatures {
    return this.calculator.calculate(studentName, candidateName);
  }

  public getFeatureArray(studentName: string, candidateName: string): number[] {
    const feat = this.calculator.calculate(studentName, candidateName);
    return this.calculator.toFeatureArray(feat);
  }
}
