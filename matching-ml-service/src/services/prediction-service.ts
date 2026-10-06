import * as tf from '@tensorflow/tfjs-node';
import { FeatureCalculator } from '../features/feature-calculator';
import { ModelManager } from './model-manager';
import { PredictionRequest, PredictionResponse, DecisionType } from '../types/prediction';
import { config } from '../config';

export class PredictionService {
  private featureCalculator = new FeatureCalculator();
  private modelManager = ModelManager.getInstance();

  public async predict(req: PredictionRequest): Promise<PredictionResponse> {
    const features = this.featureCalculator.calculate(req.studentName, req.candidateName);
    const featureArray = this.featureCalculator.toFeatureArray(features);

    let probability = 0;
    const model = this.modelManager.getModel();

    if (model) {
      const tensor = tf.tensor2d([featureArray], [1, 11]);
      const prediction = model.predict(tensor) as tf.Tensor;
      const data = await prediction.data();
      probability = data[0];
      tensor.dispose();
      prediction.dispose();
    } else {
      // Rule-based heuristic fallback if model is not yet loaded/trained
      const baseScore = features.jaroWinkler * 0.4 + features.tokenSimilarity * 0.4 + features.levenshteinSimilarity * 0.2;
      const bonus = (features.sameFirstName === 1 ? 0.05 : 0) + (features.sameLastName === 1 ? 0.05 : 0);
      probability = Math.min(1.0, Math.max(0.0, baseScore + bonus));
    }

    probability = Number(probability.toFixed(4));

    let decision: DecisionType = 'HUMAN_REVIEW';
    if (probability >= config.matchThreshold) {
      decision = 'MATCH';
    } else if (probability <= config.noMatchThreshold) {
      decision = 'NO_MATCH';
    }

    const metadata = this.modelManager.getMetadata();

    return {
      match: decision === 'MATCH',
      probability,
      decision,
      modelVersion: metadata?.version || '1.0.0',
      datasetVersion: metadata?.datasetVersion || '1.0.0',
      features,
    };
  }

  public async batchPredict(requests: PredictionRequest[]): Promise<PredictionResponse[]> {
    const results: PredictionResponse[] = [];
    for (const req of requests) {
      results.push(await this.predict(req));
    }
    return results;
  }
}
