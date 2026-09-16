const axios = require('axios');

const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

function extractRouteData(directionsResponse) {
  const route = directionsResponse.routes[0];
  const leg = route.legs[0];

  return {
    distanceText: leg.distance.text,
    durationText: leg.duration.text,
    durationInTrafficText: leg.duration_in_traffic
      ? leg.duration_in_traffic.text
      : leg.duration.text,
    polyline: route.overview_polyline.points,
    steps: leg.steps.map((step) => ({
      instructions: step.html_instructions,
      distanceText: step.distance.text,
      durationText: step.duration.text,
    })),
  };
}

async function getDirections(origin, destination) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  const response = await axios.get(DIRECTIONS_API_URL, {
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      departure_time: 'now',
      traffic_model: 'best_guess',
      key: apiKey,
    },
  });

  const { data } = response;

  if (data.status !== 'OK') {
    throw new Error(`Google Directions API error: ${data.status}`);
  }

  return extractRouteData(data);
}

module.exports = { getDirections };
