/**
 * SPACE WARS - Universal NASA API Request Handler
 * Shared between native Node server.js and Vercel Serverless Functions (/api/nasa/*)
 */

const fs = require('fs');
const path = require('path');
const url = require('url');

const NasaOpenApiService = require('./services/nasaOpenApiService');
const DonkiService = require('./services/donkiService');
const OsdrService = require('./services/osdrService');
const RadlabService = require('./services/radlabService');
const MarsTrekService = require('./services/marsTrekService');
const NasaMissionDataService = require('./services/nasaMissionDataService');

let demoData = null;
try {
  demoData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'demo-data.json'), 'utf8'));
} catch (e) {
  try {
    demoData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'demo-data.json'), 'utf8'));
  } catch (err) {
    console.warn('Could not load data/demo-data.json:', err.message);
  }
}

async function handleNasaRequest(req, res, explicitEndpoint = null) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (res.writeHead) {
      res.writeHead(204);
    } else {
      res.statusCode = 204;
    }
    res.end();
    return;
  }

  const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
  const NASA_DONKI_BASE_URL = process.env.NASA_DONKI_BASE_URL || 'https://api.nasa.gov/DONKI';
  const NASA_OSDR_BASE_URL = process.env.NASA_OSDR_BASE_URL || 'https://osdr.nasa.gov/geode-py/ws/api';
  const NASA_RADLAB_BASE_URL = process.env.NASA_RADLAB_BASE_URL || 'https://visualization.osdr.nasa.gov/radlab/api';
  const NASA_MARS_TREK_BASE_URL = process.env.NASA_MARS_TREK_BASE_URL || 'https://trek.nasa.gov';

  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const parsedQuery = {};
  for (const [k, v] of parsedUrl.searchParams.entries()) {
    parsedQuery[k] = v;
  }
  const query = Object.assign({}, parsedQuery, req.query || {});

  let endpoint = explicitEndpoint || query.endpoint;
  if (!endpoint && parsedUrl.pathname) {
    const cleanPath = parsedUrl.pathname.replace(/^\/api\/nasa\/?/, '').replace(/^\/api\/?/, '');
    endpoint = cleanPath.split('/')[0] || '';
  }
  if (!endpoint) {
    endpoint = 'status';
  }

  const sendJson = (statusCode, data, extraHeaders = {}) => {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, extraHeaders);
    if (res.writeHead) {
      res.writeHead(statusCode, headers);
    } else {
      res.statusCode = statusCode;
      for (const [k, v] of Object.entries(headers)) {
        res.setHeader(k, v);
      }
    }
    res.end(JSON.stringify(data));
  };

  if (endpoint === 'health') {
    const healthHandler = require('../api/health');
    return healthHandler(req, res);
  }

  if (endpoint === 'status') {
    return sendJson(200, {
      server: 'SPACE WARS Proxy Server',
      status: 'ONLINE',
      hasCustomApiKey: NASA_API_KEY !== 'DEMO_KEY' && NASA_API_KEY !== 'YOUR_NASA_API_KEY' && NASA_API_KEY !== 'PASTE_MY_EXISTING_NASA_KEY_HERE',
      endpoints: {
        donki: NASA_DONKI_BASE_URL,
        donkiCcmc: process.env.NASA_CCMC_DONKI_BASE_URL || 'https://ccmc.gsfc.nasa.gov/DONKI/WS/get',
        osdr: NASA_OSDR_BASE_URL,
        radlab: NASA_RADLAB_BASE_URL,
        marstrek: NASA_MARS_TREK_BASE_URL
      },
      timestamp: new Date().toISOString()
    });
  }

  if (endpoint === 'summary') {
    try {
      const summary = await NasaMissionDataService.getTelemetrySummary(NASA_API_KEY);
      return sendJson(200, summary);
    } catch (err) {
      return sendJson(500, { error: err.message });
    }
  }

  if (endpoint === 'scenario') {
    const missionId = parseInt(query.mission || '1', 10);
    const levelId = parseInt(query.level || '1', 10);
    const archetype = query.archetype || 'systems';
    try {
      const scenario = await NasaMissionDataService.getScenarioForLevel(missionId, levelId, archetype);
      return sendJson(200, scenario);
    } catch (err) {
      return sendJson(500, { error: err.message });
    }
  }

  if (endpoint === 'donki') {
    const startDate = query.startDate || null;
    try {
      const result = await DonkiService.getNotifications(startDate);
      return sendJson(200, result.events, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(200, demoData?.donki?.events || [], { 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
    }
  }

  if (endpoint === 'osdr') {
    try {
      const result = await OsdrService.getStudy87();
      return sendJson(200, result.study, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(200, { study: { 'OSD-87': { studies: [{ title: 'Spaceflight effects on mouse retina (STS-135)' }] } } }, { 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
    }
  }

  if (endpoint === 'radlab') {
    try {
      const result = await RadlabService.getIssTelemetry();
      return sendJson(200, result, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(200, { status: 'CACHED', records: [{ timestamp: '2007-07-03T10:26:10Z', absorbedDoseRate: 0.22, unit: 'µGy/min' }] }, { 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
    }
  }

  if (endpoint === 'marstrek') {
    try {
      const result = MarsTrekService.getLandmarks();
      return sendJson(200, result, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(200, { status: 'OFFLINE', landmarks: [] });
    }
  }

  if (endpoint === 'images') {
    const q = query.q || 'mars rover';
    try {
      const result = await NasaOpenApiService.searchPhotos(q);
      return sendJson(200, { collection: { items: result.items } }, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(200, { collection: { items: (demoData?.images?.photos || []).map(p => ({ data: [p], links: [{ href: p.url }] })) } }, { 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
    }
  }

  if (endpoint === 'apod') {
    try {
      const result = await NasaOpenApiService.getApod(NASA_API_KEY);
      return sendJson(200, result.data, { 'X-NASA-Status': result.status });
    } catch (err) {
      return sendJson(500, { error: err.message });
    }
  }

  return sendJson(404, { error: `Endpoint not found: ${endpoint}` });
}

module.exports = handleNasaRequest;
