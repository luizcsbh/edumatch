import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.ML_SERVICE_PORT || '3001', 10),
  host: process.env.ML_SERVICE_HOST || '0.0.0.0',
  matchThreshold: parseFloat(process.env.MATCH_THRESHOLD || '0.90'),
  noMatchThreshold: parseFloat(process.env.NO_MATCH_THRESHOLD || '0.30'),
  modelPath: process.env.MODEL_PATH || './models/model-v1.0.0',
};
