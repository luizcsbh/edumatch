import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from './config';
import { healthRoute } from './routes/health';
import { modelRoute } from './routes/model';
import { predictRoute } from './routes/predict';
import { batchPredictRoute } from './routes/batch-predict';
import { ModelManager } from './services/model-manager';

export async function buildApp() {
  const fastify = Fastify({
    logger: config.env !== 'test',
  });

  await fastify.register(cors, { origin: true });
  await fastify.register(helmet, { contentSecurityPolicy: false });

  await fastify.register(healthRoute);
  await fastify.register(modelRoute);
  await fastify.register(predictRoute);
  await fastify.register(batchPredictRoute);

  return fastify;
}

async function start() {
  const app = await buildApp();
  const modelManager = ModelManager.getInstance();

  console.log('Attempting to load active model...');
  await modelManager.loadModel();

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`EduMatch ML Service running on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
