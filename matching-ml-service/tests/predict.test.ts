import { buildApp } from '../src/index';

describe('Predict Route', () => {
  let app: any;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /api/v1/predict with matching names', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/predict',
      payload: {
        studentName: 'JOAO PEDRO DA SILVA',
        candidateName: 'JOAO PEDRO SILVA',
      },
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.probability).toBeGreaterThan(0.7);
    expect(['MATCH', 'HUMAN_REVIEW']).toContain(json.decision);
  });

  test('GET /api/v1/health returns UP', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('UP');
  });
});
