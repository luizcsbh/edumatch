import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { ModelEvaluator } from './model-evaluator';
import { ModelMetadata } from '../types/model';

export class ModelTrainer {
  private evaluator = new ModelEvaluator();

  public buildModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input(11) -> Dense(64, relu)
    model.add(tf.layers.dense({ inputShape: [11], units: 64, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Dense(32, relu)
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Dense(16, relu)
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

    // Output: Dense(1, sigmoid)
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  public parseCSV(filePath: string): { features: number[][]; labels: number[] } {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const header = lines[0].split(',');

    const jwIdx = header.indexOf('jaro_winkler');
    const levIdx = header.indexOf('levenshtein_similarity');
    const tokIdx = header.indexOf('token_similarity');
    const sameFirstIdx = header.indexOf('same_first_name');
    const sameLastIdx = header.indexOf('same_last_name');
    const firstSimIdx = header.indexOf('first_name_similarity');
    const lastSimIdx = header.indexOf('last_name_similarity');
    const sameInitIdx = header.indexOf('same_initials');
    const tokDiffIdx = header.indexOf('token_count_difference');
    const tokOrderIdx = header.indexOf('token_order_similarity');
    const fullSimIdx = header.indexOf('full_name_similarity');
    const labelIdx = header.indexOf('label');

    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length <= labelIdx) continue;

      const f = [
        parseFloat(parts[jwIdx]),
        parseFloat(parts[levIdx]),
        parseFloat(parts[tokIdx]),
        parseFloat(parts[sameFirstIdx]),
        parseFloat(parts[sameLastIdx]),
        parseFloat(parts[firstSimIdx]),
        parseFloat(parts[lastSimIdx]),
        parseFloat(parts[sameInitIdx]),
        parseFloat(parts[tokDiffIdx]),
        parseFloat(parts[tokOrderIdx]),
        parseFloat(parts[fullSimIdx]),
      ];

      const l = parseInt(parts[labelIdx], 10);
      if (!isNaN(l)) {
        features.push(f);
        labels.push(l);
      }
    }

    return { features, labels };
  }

  public async train(datasetVersion: string = '1.0.0', epochs: number = 30): Promise<ModelMetadata> {
    const baseDir = path.resolve(__dirname, '../../../dataset-pipeline/datasets');
    const trainCsv = path.join(baseDir, 'train', `dataset-v${datasetVersion}-train.csv`);
    const valCsv = path.join(baseDir, 'validation', `dataset-v${datasetVersion}-validation.csv`);
    const testCsv = path.join(baseDir, 'test', `dataset-v${datasetVersion}-test.csv`);

    console.log(`Loading training dataset: ${trainCsv}`);
    const trainData = this.parseCSV(trainCsv);
    const valData = fs.existsSync(valCsv) ? this.parseCSV(valCsv) : trainData;
    const testData = fs.existsSync(testCsv) ? this.parseCSV(testCsv) : valData;

    const xTrain = tf.tensor2d(trainData.features);
    const yTrain = tf.tensor1d(trainData.labels);
    const xVal = tf.tensor2d(valData.features);
    const yVal = tf.tensor1d(valData.labels);
    const xTest = tf.tensor2d(testData.features);
    const yTest = tf.tensor1d(testData.labels);

    const model = this.buildModel();

    console.log('Training neural network...');
    await model.fit(xTrain, yTrain, {
      epochs,
      batchSize: 32,
      validationData: [xVal, yVal],
      callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 5 }),
    });

    console.log('Evaluating model...');
    const metrics = await this.evaluator.evaluate(model, xTest, yTest);

    const modelVersion = datasetVersion;
    const outDir = path.resolve(__dirname, `../../models/model-v${modelVersion}`);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    await model.save(`file://${outDir}`);

    const metadata: ModelMetadata = {
      version: modelVersion,
      datasetVersion,
      featureVersion: '1.0.0',
      algorithmVersion: '1.0.0',
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      recall: metrics.recall,
      f1Score: metrics.f1Score,
      confusionMatrix: metrics.confusionMatrix,
      trainedAt: new Date().toISOString(),
    };

    fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

    xTrain.dispose();
    yTrain.dispose();
    xVal.dispose();
    yVal.dispose();
    xTest.dispose();
    yTest.dispose();

    console.log(`Model saved to ${outDir}`);
    return metadata;
  }
}
