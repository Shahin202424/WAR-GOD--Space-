/**
 * SPACE WARS - Vercel Serverless Function: /api/nasa/[endpoint]
 * Handles dynamic routing for all NASA API endpoints on Vercel
 */

const handleNasaRequest = require('../../backend/nasaApiHandler');

module.exports = async function handler(req, res) {
  return handleNasaRequest(req, res);
};

