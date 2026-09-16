const nock = require('nock');
const { getDirections } = require('../src/services/googleMaps');

describe('googleMaps service - getDirections', () => {
  const origin = { lat: 13.7563, lng: 100.5018 };
  const destination = { lat: 13.7469, lng: 100.5349 };

  afterEach(() => {
    nock.cleanAll();
  });

  it('parses a successful Google Directions API response', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/directions/json')
      .query(true)
      .reply(200, {
        status: 'OK',
        routes: [
          {
            overview_polyline: { points: 'abc123' },
            legs: [
              {
                distance: { text: '5.2 km' },
                duration: { text: '15 mins' },
                duration_in_traffic: { text: '22 mins' },
                steps: [
                  {
                    html_instructions: 'Head <b>east</b>',
                    distance: { text: '0.5 km' },
                    duration: { text: '2 mins' },
                  },
                ],
              },
            ],
          },
        ],
      });

    const result = await getDirections(origin, destination);

    expect(result).toEqual({
      distanceText: '5.2 km',
      durationText: '15 mins',
      durationInTrafficText: '22 mins',
      polyline: 'abc123',
      steps: [
        {
          instructions: 'Head <b>east</b>',
          distanceText: '0.5 km',
          durationText: '2 mins',
        },
      ],
    });
  });

  it('falls back to duration text when duration_in_traffic is missing', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/directions/json')
      .query(true)
      .reply(200, {
        status: 'OK',
        routes: [
          {
            overview_polyline: { points: 'xyz789' },
            legs: [
              {
                distance: { text: '1 km' },
                duration: { text: '5 mins' },
                steps: [],
              },
            ],
          },
        ],
      });

    const result = await getDirections(origin, destination);

    expect(result.durationInTrafficText).toBe('5 mins');
  });

  it('throws when Google API returns a non-OK status', async () => {
    nock('https://maps.googleapis.com')
      .get('/maps/api/directions/json')
      .query(true)
      .reply(200, { status: 'ZERO_RESULTS', routes: [] });

    await expect(getDirections(origin, destination)).rejects.toThrow(
      'Google Directions API error: ZERO_RESULTS'
    );
  });
});
