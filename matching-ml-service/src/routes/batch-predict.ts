import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PredictionService } from '../services/prediction-service';
import { batchPredictSchema } from '../schemas/batch-predict-schema';
import { BatchPredictionRequest } from '../types/prediction';

export async function batchPredictRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const service = new PredictionService();

  fastify.post<{ Body: BatchPredictionRequest }>(
    '/api/v1/batch-predict',
    { schema: batchPredictSchema },
    async (request, reply) => {
      const results = await service.batchPredict(request.body.pairs);
      return reply.code(200).send({ results });
    }
  );
}
