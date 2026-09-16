const express = require('express');
const cors = require('cors');
const directionsRouter = require('./routes/directions');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
    })
  );

  app.use('/api', directionsRouter);

  return app;
}

module.exports = createApp;
