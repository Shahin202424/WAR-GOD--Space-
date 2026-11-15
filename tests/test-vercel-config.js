/**
 * SPACE WARS - Vercel & Deployment Configuration Test Suite
 * Validates:
 * 1. JSON syntax validity of vercel.json and package.json
 * 2. Vercel configuration uses supported, modern properties (no legacy builds/routes)
 * 3. Serverless API functions work cleanly across all NASA endpoints
 * 4. Frontend static output is correctly configured
 * 5. No Render-specific remnants remain
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedCount = 0;
let totalCount = 0;

function assertTest(condition, description) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING SPACE WARS VERCEL & DEPLOYMENT VERIFICATION');
  console.log('================================================================');

  // ---------------------------------------------------------------------------
  // 1. JSON Syntax Validity
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Testing JSON Syntax Validity ---');
  const vercelPath = path.join(__dirname, '..', 'vercel.json');
  const packagePath = path.join(__dirname, '..', 'package.json');

  assertTest(fs.existsSync(vercelPath), 'vercel.json file exists in root directory');
  assertTest(fs.existsSync(packagePath), 'package.json file exists in root directory');

  let vercelConfig;
  try {
    const rawVercel = fs.readFileSync(vercelPath, 'utf8');
    vercelConfig = JSON.parse(rawVercel);
    assertTest(typeof vercelConfig === 'object' && vercelConfig !== null, 'vercel.json is valid JSON');
  } catch (err) {
    assertTest(false, `vercel.json JSON syntax error: ${err.message}`);
  }

  let packageConfig;
  try {
    const rawPackage = fs.readFileSync(packagePath, 'utf8');
    packageConfig = JSON.parse(rawPackage);
    assertTest(typeof packageConfig === 'object' && packageConfig !== null, 'package.json is valid JSON');
  } catch (err) {
    assertTest(false, `package.json JSON syntax error: ${err.message}`);
  }

  // Also check mirror directory if present
  const mirrorVercel = path.join(__dirname, '..', 'junior-astronaut-game', 'vercel.json');
  const mirrorPackage = path.join(__dirname, '..', 'junior-astronaut-game', 'package.json');
  if (fs.existsSync(mirrorVercel)) {
    const mirrorVercelJson = JSON.parse(fs.readFileSync(mirrorVercel, 'utf8'));
    assertTest(mirrorVercelJson.version === 2, 'Mirror junior-astronaut-game/vercel.json is valid JSON');
  }
  if (fs.existsSync(mirrorPackage)) {
    const mirrorPkgJson = JSON.parse(fs.readFileSync(mirrorPackage, 'utf8'));
    assertTest(mirrorPkgJson.name === 'space-wars', 'Mirror junior-astronaut-game/package.json is valid JSON');
  }

  // ---------------------------------------------------------------------------
  // 2. Vercel Configuration Supported Properties
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing Vercel Configuration Properties ---');
  assertTest(vercelConfig.version === 2, 'vercel.json specifies modern version: 2');
  assertTest(vercelConfig.framework === null, 'vercel.json explicitly sets framework: null for "Other" preset');
  assertTest(vercelConfig.cleanUrls === true, 'vercel.json specifies cleanUrls: true');
  assertTest(vercelConfig.outputDirectory === '.', 'vercel.json explicitly configures outputDirectory: "." for root static site');
  assertTest(vercelConfig.buildCommand === 'npm run build', 'vercel.json matches package.json buildCommand');

  // Verify NO deprecated legacy properties
  assertTest(!('builds' in vercelConfig), 'vercel.json does NOT contain deprecated "builds" array');
  assertTest(!('routes' in vercelConfig), 'vercel.json does NOT contain deprecated "routes" array');
  assertTest(!('name' in vercelConfig), 'vercel.json does NOT contain legacy "name" property');
  assertTest(!('alias' in vercelConfig), 'vercel.json does NOT contain legacy "alias" property');

  // Verify Rewrites & Headers
  assertTest(Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.length > 0, 'vercel.json contains valid rewrites array');
  const apiRewrite = vercelConfig.rewrites.find(r => r.source.includes('/api/nasa/'));
  assertTest(!!apiRewrite, 'Rewrites array contains mapping for /api/nasa/:endpoint*');

  assertTest(Array.isArray(vercelConfig.headers) && vercelConfig.headers.length > 0, 'vercel.json contains valid headers array');
  const corsHeaderRule = vercelConfig.headers.find(h => h.source.includes('/api/'));
  assertTest(!!corsHeaderRule, 'Headers array configures CORS headers for API endpoints');

  // ---------------------------------------------------------------------------
  // 3. API Serverless Functions Correctly Configured
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing API Serverless Functions ---');
  const apiNasaEndpointPath = path.join(__dirname, '..', 'api', 'nasa', '[endpoint].js');
  const apiNasaIndexPath = path.join(__dirname, '..', 'api', 'nasa', 'index.js');
  const apiIndexPath = path.join(__dirname, '..', 'api', 'index.js');
  const backendHandlerPath = path.join(__dirname, '..', 'backend', 'nasaApiHandler.js');

  assertTest(fs.existsSync(apiNasaEndpointPath), 'api/nasa/[endpoint].js exists');
  assertTest(fs.existsSync(apiNasaIndexPath), 'api/nasa/index.js exists');
  assertTest(fs.existsSync(apiIndexPath), 'api/index.js exists');
  assertTest(fs.existsSync(backendHandlerPath), 'backend/nasaApiHandler.js exists');

  const handler = require('../backend/nasaApiHandler');
  assertTest(typeof handler === 'function', 'nasaApiHandler exports callable async function');

  // Mock helper for Vercel Serverless Function testing
  function createMockReqRes(options) {
    const req = {
      method: options.method || 'GET',
      url: options.url || '/',
      query: options.query || {},
      headers: options.headers || {}
    };

    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = {
      setHeader(k, v) { responseHeaders[k.toLowerCase()] = v; },
      writeHead(code, headers = {}) {
        statusCode = code;
        for (const [k, v] of Object.entries(headers)) {
          responseHeaders[k.toLowerCase()] = v;
        }
      },
      end(chunk) {
        if (chunk) responseBody += chunk;
      },
      get statusCode() { return statusCode; },
      set statusCode(c) { statusCode = c; },
      getHeaders() { return responseHeaders; },
      getBody() { return responseBody; },
      getJson() { return JSON.parse(responseBody); }
    };

    return { req, res };
  }

  // Test 3.1: OPTIONS preflight
  {
    const { req, res } = createMockReqRes({ method: 'OPTIONS', url: '/api/nasa/status' });
    await handler(req, res);
    assertTest(res.statusCode === 204, 'OPTIONS preflight returns 204 No Content');
    assertTest(res.getHeaders()['access-control-allow-origin'] === '*', 'OPTIONS preflight returns Access-Control-Allow-Origin: *');
  }

  // Test 3.2: /api/nasa/status
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/status', query: { endpoint: 'status' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/status returns status 200');
    const json = res.getJson();
    assertTest(json.status === 'ONLINE', '/api/nasa/status reports status ONLINE');
    assertTest(json.server.includes('SPACE WARS'), '/api/nasa/status identifies SPACE WARS server');
    assertTest(json.endpoints && json.endpoints.donki, '/api/nasa/status reports endpoints');
  }

  // Test 3.3: /api/nasa/summary
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/summary', query: { endpoint: 'summary' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/summary returns status 200');
    const json = res.getJson();
    assertTest(json.timestamp && json.services, '/api/nasa/summary contains timestamp and services dictionary');
  }

  // Test 3.4: /api/nasa/scenario
  {
    const { req, res } = createMockReqRes({
      url: '/api/nasa/scenario?mission=1&level=2&archetype=rocket',
      query: { endpoint: 'scenario', mission: '1', level: '2', archetype: 'rocket' }
    });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/scenario returns status 200');
    const json = res.getJson();
    assertTest(json.missionId === 1 && json.levelInMission === 2, '/api/nasa/scenario matches requested mission and level');
    assertTest(json.archetype === 'rocket', '/api/nasa/scenario matches requested archetype');
  }

  // Test 3.5: /api/nasa/donki
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/donki', query: { endpoint: 'donki' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/donki returns status 200');
    const json = res.getJson();
    assertTest(Array.isArray(json), '/api/nasa/donki returns array of space weather events');
  }

  // Test 3.6: /api/nasa/osdr
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/osdr', query: { endpoint: 'osdr' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/osdr returns status 200');
    const json = res.getJson();
    assertTest(typeof json === 'object', '/api/nasa/osdr returns NASA OSDR biological study payload');
  }

  // Test 3.7: /api/nasa/radlab
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/radlab', query: { endpoint: 'radlab' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/radlab returns status 200');
    const json = res.getJson();
    assertTest(json.records && Array.isArray(json.records), '/api/nasa/radlab returns dosimeter records');
  }

  // Test 3.8: /api/nasa/marstrek
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/marstrek', query: { endpoint: 'marstrek' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/marstrek returns status 200');
    const json = res.getJson();
    assertTest(json.landmarks && Array.isArray(json.landmarks), '/api/nasa/marstrek returns landmarks array');
  }

  // Test 3.9: /api/nasa/images
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/images?q=mars', query: { endpoint: 'images', q: 'mars' } });
    await handler(req, res);
    assertTest(res.statusCode === 200, '/api/nasa/images returns status 200');
    const json = res.getJson();
    assertTest(json.collection && Array.isArray(json.collection.items), '/api/nasa/images returns image collection');
  }

  // Test 3.10: /api/nasa/unknown
  {
    const { req, res } = createMockReqRes({ url: '/api/nasa/nonexistent', query: { endpoint: 'nonexistent' } });
    await handler(req, res);
    assertTest(res.statusCode === 404, 'Unknown API endpoint returns 404');
  }

  // ---------------------------------------------------------------------------
  // 4. Frontend Static Output Configuration
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Testing Frontend Static Output ---');
  const indexHtmlPath = path.join(__dirname, '..', 'index.html');
  const styleCssPath = path.join(__dirname, '..', 'style.css');
  const scriptJsPath = path.join(__dirname, '..', 'script.js');

  assertTest(fs.existsSync(indexHtmlPath), 'index.html exists at project root (serves as default /)');
  assertTest(fs.existsSync(styleCssPath), 'style.css exists at project root');
  assertTest(fs.existsSync(scriptJsPath), 'script.js exists at project root');

  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  assertTest(htmlContent.includes('<title>SPACE WARS') || htmlContent.includes('<title>SPACE WARS -'), 'index.html contains SPACE WARS title');
  assertTest(htmlContent.includes('game-canvas'), 'index.html contains game-canvas element');

  // Verify build script in package.json
  assertTest(typeof packageConfig.scripts.build === 'string', 'package.json defines "build" script');
  assertTest(typeof packageConfig.scripts.start === 'string', 'package.json keeps "start" script for local server');

  // ---------------------------------------------------------------------------
  // 5. No Render-Specific Remnants
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Absence of Render-Specific Remnants ---');
  const renderYaml = path.join(__dirname, '..', 'render.yaml');
  const renderYamlHidden = path.join(__dirname, '..', '.render.yaml');
  const procfile = path.join(__dirname, '..', 'Procfile');

  assertTest(!fs.existsSync(renderYaml), 'No render.yaml file in root directory');
  assertTest(!fs.existsSync(renderYamlHidden), 'No .render.yaml file in root directory');
  assertTest(!fs.existsSync(procfile), 'No Procfile file in root directory');

  // Check package.json scripts for any render references
  const packageStr = JSON.stringify(packageConfig);
  assertTest(!packageStr.toLowerCase().includes('render.com'), 'package.json contains no render.com references');
  assertTest(!packageStr.toLowerCase().includes('render_'), 'package.json contains no RENDER_ env references');

  console.log('\n================================================================');
  console.log(`🎉 ALL VERCEL DEPLOYMENT CHECKS PASSED: ${passedCount} / ${totalCount} (100.0%)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});

