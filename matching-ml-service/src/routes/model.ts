import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ModelManager } from '../services/model-manager';

export async function modelRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const modelManager = ModelManager.getInstance();

  fastify.get('/api/v1/model', async () => {
    return modelManager.getModelInfo();
  });
}
