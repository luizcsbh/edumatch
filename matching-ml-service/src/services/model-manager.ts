import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { ModelMetadata, ModelInfo } from '../types/model';
import { config } from '../config';

export class ModelManager {
  private static instance: ModelManager;
  private currentModel: tf.LayersModel | null = null;
  private currentMetadata: ModelMetadata | null = null;

  private constructor() {}

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  public async loadModel(modelDir?: string): Promise<boolean> {
    const dir = modelDir || config.modelPath;
    const modelJsonPath = path.resolve(dir, 'model.json');
    const metadataPath = path.resolve(dir, 'metadata.json');

    try {
      if (!fs.existsSync(modelJsonPath)) {
        console.warn(`Model not found at ${modelJsonPath}`);
        return false;
      }

      this.currentModel = await tf.loadLayersModel(`file://${modelJsonPath}`);
      if (fs.existsSync(metadataPath)) {
        this.currentMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }
      console.log(`Loaded model version: ${this.currentMetadata?.version || 'unknown'}`);
      return true;
    } catch (err) {
      console.error('Failed to load TensorFlow model:', err);
      return false;
    }
  }

  public getModel(): tf.LayersModel | null {
    return this.currentModel;
  }

  public getMetadata(): ModelMetadata | null {
    return this.currentMetadata;
  }

  public getModelInfo(): ModelInfo {
    return {
      version: this.currentMetadata?.version || '1.0.0',
      datasetVersion: this.currentMetadata?.datasetVersion || '1.0.0',
      status: this.currentModel ? 'LOADED' : 'NOT_LOADED',
      metadata: this.currentMetadata || undefined,
    };
  }

  public setModel(model: tf.LayersModel, metadata: ModelMetadata): void {
    this.currentModel = model;
    this.currentMetadata = metadata;
  }
}
