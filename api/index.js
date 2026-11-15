/**
 * SPACE WARS - Vercel Serverless Function: /api
 * Root API status endpoint
 */

const handleNasaRequest = require('../backend/nasaApiHandler');

module.exports = async function handler(req, res) {
  return handleNasaRequest(req, res, 'status');
};

