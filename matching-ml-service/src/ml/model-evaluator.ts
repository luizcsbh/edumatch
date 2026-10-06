import * as tf from '@tensorflow/tfjs-node';

export interface EvaluationMetrics {
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
}

export class ModelEvaluator {
  public async evaluate(model: tf.LayersModel, xTest: tf.Tensor2D, yTest: tf.Tensor1D, threshold: number = 0.5): Promise<EvaluationMetrics> {
    const rawPredictions = model.predict(xTest) as tf.Tensor;
    const predData = await rawPredictions.data();
    const actualData = await yTest.data();

    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    for (let i = 0; i < predData.length; i++) {
      const pred = predData[i] >= threshold ? 1 : 0;
      const actual = actualData[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    rawPredictions.dispose();

    const total = tp + fp + tn + fn;
    const accuracy = total > 0 ? (tp + tn) / total : 0;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy: Number(accuracy.toFixed(4)),
      precision: Number(precision.toFixed(4)),
      recall: Number(recall.toFixed(4)),
      f1Score: Number(f1Score.toFixed(4)),
      confusionMatrix: { tp, fp, tn, fn },
    };
  }
}
