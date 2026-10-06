import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export async function healthRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/api/v1/health', async () => {
    return {
      status: 'UP',
      service: 'matching-ml-service',
      timestamp: new Date().toISOString(),
    };
  });
}
