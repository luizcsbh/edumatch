import { CalculatedFeatures } from '../features/feature-calculator';

export interface PredictionRequest {
  studentName: string;
  candidateName: string;
}

export type DecisionType = 'MATCH' | 'NO_MATCH' | 'HUMAN_REVIEW';

export interface PredictionResponse {
  match: boolean;
  probability: number;
  decision: DecisionType;
  modelVersion: string;
  datasetVersion: string;
  features?: CalculatedFeatures;
}

export interface BatchPredictionRequest {
  pairs: PredictionRequest[];
}

export interface BatchPredictionResponse {
  results: PredictionResponse[];
}
