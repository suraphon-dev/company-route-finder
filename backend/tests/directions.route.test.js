jest.mock('../src/services/googleMaps');

const request = require('supertest');
const createApp = require('../src/app');
const { getDirections } = require('../src/services/googleMaps');

describe('POST /api/directions', () => {
  let app;

  beforeEach(() => {
    process.env.COMPANY_LAT = '13.7469';
    process.env.COMPANY_LNG = '100.5349';
    app = createApp();
    jest.clearAllMocks();
  });

  it('returns 200 with directions data for valid input', async () => {
    getDirections.mockResolvedValue({
      distanceText: '5.2 km',
      durationText: '15 mins',
      durationInTrafficText: '22 mins',
      polyline: 'abc123',
      steps: [],
    });

    const res = await request(app)
      .post('/api/directions')
      .send({ lat: 13.7563, lng: 100.5018 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      distanceText: '5.2 km',
      durationText: '15 mins',
      durationInTrafficText: '22 mins',
      polyline: 'abc123',
      steps: [],
    });
  });

  it('returns 400 when lat/lng are missing', async () => {
    const res = await request(app).post('/api/directions').send({});

    expect(res.status).toBe(400);
    expect(getDirections).not.toHaveBeenCalled();
  });

  it('returns 400 when lat/lng are out of range', async () => {
    const res = await request(app)
      .post('/api/directions')
      .send({ lat: 999, lng: 100.5018 });

    expect(res.status).toBe(400);
    expect(getDirections).not.toHaveBeenCalled();
  });

  it('returns 500 without leaking error details when the service throws', async () => {
    getDirections.mockRejectedValue(new Error('some internal google api error with key=SECRET'));

    const res = await request(app)
      .post('/api/directions')
      .send({ lat: 13.7563, lng: 100.5018 });

    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/SECRET/);
  });
});
