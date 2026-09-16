const express = require('express');
const { getDirections } = require('../services/googleMaps');

const router = express.Router();

function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

router.post('/directions', async (req, res) => {
  const { lat, lng } = req.body || {};

  if (!isValidCoordinate(lat, lng)) {
    return res.status(400).json({
      error: 'Invalid or missing lat/lng. lat must be -90..90, lng must be -180..180.',
    });
  }

  const origin = { lat, lng };
  const destination = {
    lat: Number(process.env.COMPANY_LAT),
    lng: Number(process.env.COMPANY_LNG),
  };

  try {
    const directions = await getDirections(origin, destination);
    return res.status(200).json(directions);
  } catch (err) {
    return res.status(500).json({ error: 'Unable to fetch directions at this time.' });
  }
});

module.exports = router;
