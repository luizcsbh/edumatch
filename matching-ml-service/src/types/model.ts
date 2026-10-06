export interface ModelMetadata {
  version: string;
  datasetVersion: string;
  featureVersion: string;
  algorithmVersion: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  trainedAt: string;
}

export interface ModelInfo {
  version: string;
  datasetVersion: string;
  status: 'LOADED' | 'NOT_LOADED' | 'TRAINING';
  metadata?: ModelMetadata;
}
