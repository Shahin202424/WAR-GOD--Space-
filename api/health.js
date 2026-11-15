/**
 * SPACE WARS - Vercel Serverless Function: /api/health
 * Health check endpoint for uptime monitors, status checks, and platform verification
 */

module.exports = async function handler(req, res) {
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

  const payload = {
    status: 'OK',
    service: 'SPACE WARS',
    timestamp: new Date().toISOString()
  };

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  if (res.writeHead) {
    res.writeHead(200, headers);
  } else {
    res.statusCode = 200;
    for (const [k, v] of Object.entries(headers)) {
      res.setHeader(k, v);
    }
  }

  res.end(JSON.stringify(payload));
};

