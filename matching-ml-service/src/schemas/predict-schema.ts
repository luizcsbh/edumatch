export const predictSchema = {
  body: {
    type: 'object',
    required: ['studentName', 'candidateName'],
    properties: {
      studentName: { type: 'string', minLength: 1 },
      candidateName: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        match: { type: 'boolean' },
        probability: { type: 'number' },
        decision: { type: 'string' },
        modelVersion: { type: 'string' },
        datasetVersion: { type: 'string' },
        features: { type: 'object', additionalProperties: true },
      },
    },
  },
};
