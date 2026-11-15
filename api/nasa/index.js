/**
 * SPACE WARS - Vercel Serverless Function: /api/nasa
 * Root status endpoint for NASA API proxy
 */

const handleNasaRequest = require('../../backend/nasaApiHandler');

module.exports = async function handler(req, res) {
  return handleNasaRequest(req, res, 'status');
};

