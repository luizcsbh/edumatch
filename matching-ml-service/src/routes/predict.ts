import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PredictionService } from '../services/prediction-service';
import { predictSchema } from '../schemas/predict-schema';
import { PredictionRequest } from '../types/prediction';

export async function predictRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const service = new PredictionService();

  fastify.post<{ Body: PredictionRequest }>(
    '/api/v1/predict',
    { schema: predictSchema },
    async (request, reply) => {
      const result = await service.predict(request.body);
      return reply.code(200).send(result);
    }
  );
}
