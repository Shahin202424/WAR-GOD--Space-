/**
 * SPACE WARS - Lightweight Backend Proxy & Static Server
 * Built with native Node.js (zero external dependencies required)
 * 
 * Provides:
 * 1. Secure server-side proxying of NASA APIs (protecting API keys from client exposure)
 * 2. Static file serving for the complete HTML5/JS/CSS game
 * 3. Graceful fallback and telemetry endpoints
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Backend NASA Modular Services
const NasaOpenApiService = require('./backend/services/nasaOpenApiService');
const DonkiService = require('./backend/services/donkiService');
const OsdrService = require('./backend/services/osdrService');
const RadlabService = require('./backend/services/radlabService');
const MarsTrekService = require('./backend/services/marsTrekService');
const NasaMissionDataService = require('./backend/services/nasaMissionDataService');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');
  const targetPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(examplePath) ? examplePath : null);

  if (targetPath) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key] && val !== 'YOUR_NASA_API_KEY') {
              process.env[key] = val;
            }
          }
        }
      });
    } catch (e) {
      console.warn('Note: Could not parse .env file, using environment defaults.', e.message);
    }
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_DONKI_BASE_URL = process.env.NASA_DONKI_BASE_URL || 'https://api.nasa.gov/DONKI';
const NASA_OSDR_BASE_URL = process.env.NASA_OSDR_BASE_URL || 'https://osdr.nasa.gov/geode-py/ws/api';
const NASA_RADLAB_BASE_URL = process.env.NASA_RADLAB_BASE_URL || 'https://visualization.osdr.nasa.gov/radlab/api';
const NASA_MARS_TREK_BASE_URL = process.env.NASA_MARS_TREK_BASE_URL || 'https://trek.nasa.gov';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) JuniorAstronautTrainer/2026',
  'Accept': 'application/json, text/plain, */*'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8'
};

// Cached fallback data
let demoData = null;
try {
  demoData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'demo-data.json'), 'utf8'));
} catch (e) {
  console.warn('Could not preload data/demo-data.json:', e.message);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ---------------------------------------------------------------------------
  // 1. API PROXY ENDPOINTS
  // ---------------------------------------------------------------------------
  if (pathname.startsWith('/api/nasa/')) {
    const endpoint = pathname.replace('/api/nasa/', '');

    if (endpoint === 'status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
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
      }));
      return;
    }

    if (endpoint === 'summary') {
      try {
        const summary = await NasaMissionDataService.getTelemetrySummary(NASA_API_KEY);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(summary));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    if (endpoint === 'scenario') {
      const missionId = parseInt(parsedUrl.query.mission || '1', 10);
      const levelId = parseInt(parsedUrl.query.level || '1', 10);
      const archetype = parsedUrl.query.archetype || 'systems';

      try {
        const scenario = await NasaMissionDataService.getScenarioForLevel(missionId, levelId, archetype);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(scenario));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    if (endpoint === 'donki') {
      const startDate = parsedUrl.query.startDate || null;
      try {
        const result = await DonkiService.getNotifications(startDate);
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify(result.events));
        return;
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
        res.end(JSON.stringify(demoData?.donki?.events || []));
        return;
      }
    }

    if (endpoint === 'osdr') {
      try {
        const result = await OsdrService.getStudy87();
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify(result.study));
        return;
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
        res.end(JSON.stringify({ study: { 'OSD-87': { studies: [{ title: 'Spaceflight effects on mouse retina (STS-135)' }] } } }));
        return;
      }
    }

    if (endpoint === 'radlab') {
      try {
        const result = await RadlabService.getIssTelemetry();
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
        res.end(JSON.stringify({ status: 'CACHED', records: [{ timestamp: '2007-07-03T10:26:10Z', absorbedDoseRate: 0.22, unit: 'µGy/min' }] }));
        return;
      }
    }

    if (endpoint === 'marstrek') {
      try {
        const result = MarsTrekService.getLandmarks();
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OFFLINE', landmarks: [] }));
        return;
      }
    }

    if (endpoint === 'images') {
      const q = parsedUrl.query.q || 'mars rover';
      try {
        const result = await NasaOpenApiService.searchPhotos(q);
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify({ collection: { items: result.items } }));
        return;
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Mode': 'ARCHIVED_FALLBACK' });
        res.end(JSON.stringify({ collection: { items: (demoData?.images?.photos || []).map(p => ({ data: [p], links: [{ href: p.url }] })) } }));
        return;
      }
    }

    if (endpoint === 'apod') {
      try {
        const result = await NasaOpenApiService.getApod(NASA_API_KEY);
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-NASA-Status': result.status });
        res.end(JSON.stringify(result.data));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. STATIC FILE SERVING
  // ---------------------------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = 'index.html';
  }

  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - SPACE WARS');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

let currentPort = PORT;

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`================================================================`);
    console.log(`🚀 SPACE WARS Server Running!`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`🔒 Proxy: /api/nasa/* enabled (protecting client credentials)`);
    console.log(`================================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${currentPort} is currently in use.`);
    currentPort++;
    console.log(`🔄 Automatically trying next port ${currentPort}...`);
    setTimeout(() => startServer(currentPort), 250);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);
