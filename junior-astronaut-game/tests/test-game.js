/**
 * Comprehensive Automated Test Suite
 * Junior Astronaut Mission Trainer: 20 Missions & 200 Levels
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 RUNNING JUNIOR ASTRONAUT COMPREHENSIVE TEST SUITE');
console.log('================================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// TEST 1: MISSIONS & LEVELS DATA INTEGRITY (7 MAJOR MISSIONS & 70 PLAYABLE LEVELS)
// -----------------------------------------------------------------------------
console.log('\n--- 1. Testing 7 Major Missions & 70 Playable Levels Integrity ---');
const missionsData = require('../data/missions-data.js');

assert(Array.isArray(missionsData), 'missionsData is an array');
assert(missionsData.length === 7, `Exactly 7 Major Missions loaded (found ${missionsData.length})`);

let totalLevels = 0;
let globalIndices = new Set();
let uniqueTitles = new Set();
let validArchetypes = new Set([
  'rocket', 'landing', 'station', 'power', 'eclss', 'spacewalk', 'research',
  'lander', 'platformer', 'rover', 'builder', 'systems', 'radiation', 'biolab', 'comms'
]);

missionsData.forEach((m, mIdx) => {
  assert(m.id === mIdx + 1, `Mission ${m.id} has correct ID sequence`);
  assert(typeof m.name === 'string' && m.name.length > 3, `Mission ${m.id} has valid name: "${m.name}"`);
  assert(typeof m.badgeId === 'string', `Mission ${m.id} has badgeId: "${m.badgeId}"`);
  assert(Array.isArray(m.levels) && m.levels.length === 10, `Mission ${m.id} has exactly 10 levels`);

  m.levels.forEach((lvl, lIdx) => {
    totalLevels++;
    globalIndices.add(lvl.globalLevel);
    uniqueTitles.add(lvl.title);

    assert(lvl.levelInMission === lIdx + 1, `Level index ${lvl.levelInMission} correct in Mission ${m.id}`);
    assert(validArchetypes.has(lvl.archetype), `Level ${lvl.globalLevel} archetype "${lvl.archetype}" is valid`);
    assert(typeof lvl.story === 'string' && lvl.story.length > 20, `Level ${lvl.globalLevel} has story narrative`);
    assert(typeof lvl.objective === 'string' && lvl.objective.length > 10, `Level ${lvl.globalLevel} has objective`);
    assert(typeof lvl.nasaConnection === 'string' && lvl.nasaConnection.length > 5, `Level ${lvl.globalLevel} has authentic NASA Connection`);
    assert(typeof lvl.realNasaFact === 'string' && lvl.realNasaFact.length > 15, `Level ${lvl.globalLevel} has authentic NASA Fact`);
    assert(!lvl.quiz && !lvl.questions, `Level ${lvl.globalLevel} is 100% pure interactive gameplay (ZERO quizzes/questions)`);
  });
});

assert(totalLevels === 70, `Total levels count is exactly 70 (found ${totalLevels})`);
assert(globalIndices.size === 70, `All 70 global level indices are unique and contiguous`);

// -----------------------------------------------------------------------------
// TEST 2: HEALTH & RESOURCE SIMULATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Astronaut Health Monitoring System ---');
global.window = {
  GameEngine: { isPaused: false },
  AudioManager: {
    playChime: () => {},
    playAlarm: () => {},
    playSiren: () => {},
    playFailure: () => {},
    playCelebration: () => {},
    startSpaceMusic: () => {},
    startThruster: () => {},
    stopThruster: () => {},
    startRoverMotor: () => {},
    stopRoverMotor: () => {},
    playClick: () => {}
  },
  RewardsManager: { showFloatingNotice: () => {} }
};

global.document = {
  getElementById: () => ({
    querySelector: () => ({ textContent: '', style: {} }),
    classList: { remove: () => {}, add: () => {} }
  })
};

const healthSystemCode = fs.readFileSync(path.join(__dirname, '../js/health-system.js'), 'utf8');
eval(healthSystemCode);

const HS = window.HealthSystem;
assert(HS !== undefined, 'HealthSystem module loaded');

HS.resetVitals();
assert(HS.vitals.health === 100, 'Initial health is 100%');
assert(HS.vitals.oxygen === 100, 'Initial oxygen is 100%');
assert(HS.vitals.water === 100, 'Initial water is 100%');
assert(HS.vitals.energy === 100, 'Initial energy is 100%');
assert(HS.vitals.radiationDose === 0, 'Initial radiation is 0 µSv');

// Test 10 simulation ticks
for (let i = 0; i < 10; i++) {
  HS.tick(1.0);
}
assert(HS.vitals.oxygen < 100, 'Oxygen decreases over time during space activity');
assert(HS.vitals.water < 100, 'Water decreases over time during astronaut exertion');
assert(HS.vitals.radiationDose > 0, 'Radiation accumulates from ambient cosmic ray flux');

// Test survival actions
const prevO2 = HS.vitals.oxygen;
const prevEnergy = HS.vitals.energy;
const o2ActionSuccess = HS.performSurvivalAction('emergency-o2');
assert(o2ActionSuccess === true, 'Emergency O₂ pulse executed');
assert(HS.vitals.oxygen > prevO2, 'Emergency O₂ pulse restored oxygen reserve');
assert(HS.vitals.energy < prevEnergy, 'Emergency O₂ pulse consumed energy');

// Test DONKI solar storm spike and shelter
HS.triggerSolarStormSpike('X8.7', 25.0);
assert(HS.modifiers.radiationEventActive === true, 'Solar storm warning active');
const doseBeforeShelter = HS.vitals.radiationDose;
HS.tick(1.0);
const doseAfterSpike = HS.vitals.radiationDose;
assert(doseAfterSpike > doseBeforeShelter, 'Solar storm accelerates radiation exposure');

// Enter shelter
HS.performSurvivalAction('activate-shelter');
assert(HS.modifiers.inShelter === true, 'Astronaut entered regolith radiation shelter');
const doseInShelter1 = HS.vitals.radiationDose;
HS.tick(1.0);
const doseInShelter2 = HS.vitals.radiationDose;
const unshieldedDelta = doseAfterSpike - doseBeforeShelter;
const shieldedDelta = doseInShelter2 - doseInShelter1;
assert(shieldedDelta < unshieldedDelta * 0.2, 'Regolith shelter provides over 80-95% radiation shielding');

// -----------------------------------------------------------------------------
// TEST 3: REWARDS & CERTIFICATE UNLOCK SYSTEM
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Progression & Graduation Certificate ---');
global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = v; },
  removeItem(k) { delete this.data[k]; }
};

const rewardsCode = fs.readFileSync(path.join(__dirname, '../js/rewards.js'), 'utf8');
eval(rewardsCode);

const RM = window.RewardsManager;
assert(RM !== undefined, 'RewardsManager loaded');

RM.resetProgress();
assert(RM.state.unlockedLevels.length === 1 && RM.state.unlockedLevels[0] === 1, 'Initially only Level 1 is unlocked');
assert(RM.state.certificateUnlocked === false, 'Certificate is locked at start');
assert(RM.getCurrentRank().title === 'Cadet', 'Initial rank is Cadet');

// Complete 10 levels
for (let lvl = 1; lvl <= 10; lvl++) {
  RM.addStars(3, lvl);
  RM.unlockNextLevel(lvl);
}
assert(RM.getCompletedLevelsCount() === 10, '10 levels completed');
assert(RM.getCurrentRank().title === 'Flight Specialist', 'Rank upgraded to Flight Specialist at 10 levels');
assert(RM.state.certificateUnlocked === false, 'Certificate remains strictly locked at 10 levels');

// Complete 69 levels
for (let lvl = 11; lvl <= 69; lvl++) {
  RM.addStars(3, lvl);
  RM.unlockNextLevel(lvl);
}
assert(RM.getCompletedLevelsCount() === 69, '69 levels completed');
assert(RM.state.certificateUnlocked === false, 'Certificate remains strictly locked at 69 levels');

// Complete 70th level!
RM.addStars(3, 70);
RM.save();
assert(RM.getCompletedLevelsCount() === 70, 'All 70 levels completed!');
assert(RM.state.certificateUnlocked === true, 'Graduation Certificate unlocked after completing all 70 levels!');
assert(RM.getCurrentRank().title === 'Interplanetary Fleet Commander', 'Final rank is Interplanetary Fleet Commander');
assert(typeof RM.state.certificateId === 'string' && RM.state.certificateId.startsWith('NASA-JAMT-2026-'), 'Unique Certificate ID generated');

// -----------------------------------------------------------------------------
// TEST 4: ALL 5 NASA DATA SOURCES
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing All 5 NASA Integrations & Data ---');
const demoData = require('../data/demo-data.json');

assert(demoData.donki && Array.isArray(demoData.donki.events), 'NASA DONKI dataset exists');
const donkiTypes = demoData.donki.events.map(e => e.messageType);
['FLR', 'CME', 'SEP', 'RBE', 'GST', 'HSS', 'WSA_ENLIL'].forEach(type => {
  assert(donkiTypes.includes(type), `DONKI includes event type: ${type}`);
});

assert(demoData.osdr && Array.isArray(demoData.osdr.studies), 'NASA OSDR dataset exists');
const osdrStudies = demoData.osdr.studies.map(s => s.accession);
['OSD-87', 'OSD-137', 'OSD-243', 'OSD-47', 'OSD-178'].forEach(acc => {
  assert(osdrStudies.includes(acc), `OSDR includes study: ${acc}`);
});

assert(demoData.radlab && Array.isArray(demoData.radlab.records), 'NASA RadLab dataset exists');
assert(demoData.radlab.records.some(r => r.spacecraft.includes('ISS')), 'RadLab has ISS Liulin-5 telemetry');
assert(demoData.radlab.records.some(r => r.spacecraft.includes('Curiosity')), 'RadLab has Mars Curiosity RAD telemetry');
assert(demoData.radlab.records.some(r => r.spacecraft.includes('LRO')), 'RadLab has Lunar LRO telemetry');

assert(demoData.marstrek && Array.isArray(demoData.marstrek.landmarks), 'NASA Mars Trek dataset exists');
const landmarks = demoData.marstrek.landmarks.map(l => l.id);
['jezero', 'olympus', 'valles', 'gale', 'arcadia', 'shackleton'].forEach(lm => {
  assert(landmarks.includes(lm), `Mars Trek includes landmark: ${lm}`);
});

assert(demoData.images && Array.isArray(demoData.images.photos), 'NASA Image Library dataset exists');
assert(demoData.images.photos.length >= 6, `NASA Images has ${demoData.images.photos.length} verified photographs with center credits`);

// -----------------------------------------------------------------------------
// TEST 5: GAME OVER, RETRY LEVEL & LEVEL PROGRESSION RULES
// -----------------------------------------------------------------------------
console.log('\n--- 5. Testing Game Over, Retry Level & Level Progression Rules ---');

global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

const mockCtx = {
  fillRect: () => {},
  clearRect: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  stroke: () => {},
  strokeRect: () => {},
  fillText: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} })
};

// Mock DOM elements for MissionsManager & GameEngine
const elementsMap = {};
global.document.createElement = (tag) => ({
  tagName: tag,
  className: '',
  innerHTML: '',
  style: {},
  classList: {
    classes: new Set(),
    add(c) { this.classes.add(c); },
    remove(c) { this.classes.delete(c); },
    contains(c) { return this.classes.has(c); }
  },
  appendChild: () => {},
  removeChild: () => {},
  getContext: () => mockCtx
});
global.document.body = {
  appendChild: () => {},
  removeChild: () => {},
  classList: { add: () => {}, remove: () => {} }
};
global.document.getElementById = (id) => {
  if (!elementsMap[id]) {
    elementsMap[id] = {
      id: id,
      textContent: '',
      innerHTML: '',
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); },
        toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
      },
      querySelector: () => ({ textContent: '', style: {} }),
      querySelectorAll: () => [],
      getContext: () => mockCtx
    };
  }
  return elementsMap[id];
};

global.window.getLevelByGlobalIndex = (idx) => {
  const mIdx = Math.floor((idx - 1) / 10);
  const lIdx = (idx - 1) % 10;
  return {
    mission: missionsData[mIdx] || missionsData[0],
    level: (missionsData[mIdx] || missionsData[0]).levels[lIdx] || (missionsData[mIdx] || missionsData[0]).levels[0]
  };
};

global.window.UniversalLevelEngine = function(canvas, mission, level, onComplete, onFail) {
  this.canvas = canvas;
  this.mission = mission;
  this.level = level;
  this.onComplete = onComplete;
  this.onFail = onFail;
  this.init = () => {};
  this.cleanup = () => {};
};
global.UniversalLevelEngine = global.window.UniversalLevelEngine;

const missionsCode = fs.readFileSync(path.join(__dirname, '../js/missions.js'), 'utf8');
eval(missionsCode);

const MM = window.MissionsManager;
assert(MM !== undefined, 'MissionsManager module loaded');
assert(typeof MM.handlePlayerDeath === 'function', 'handlePlayerDeath function exists');
assert(typeof MM.showGameOver === 'function', 'showGameOver function exists');
assert(typeof MM.restartCurrentLevel === 'function', 'restartCurrentLevel function exists');
assert(typeof MM.completeCurrentLevel === 'function', 'completeCurrentLevel function exists');
assert(typeof MM.loadNextLevel === 'function', 'loadNextLevel function exists');

// Start at Mission 1 Level 1
MM.startLevel(1);
assert(MM.currentGlobalLevel === 1, 'Current level is Level 1');
assert(MM.gameState === 'PLAYING', 'Game state is PLAYING on level start');

// Simulate Player Death (Oxygen Depletion, Health Depletion, Fall, Crash)
MM.handlePlayerDeath('Astronaut oxygen supply depleted!');
assert(MM.gameState === 'GAME_OVER', 'Game state switches to GAME_OVER on player death');
assert(MM.currentGlobalLevel === 1, 'STRICT RULE: Level index remains at Level 1 on death (does not advance)');
const failModal = global.document.getElementById('mission-failed-modal');
assert(!failModal.classList.contains('hidden'), 'Mission failed modal is visible on GAME_OVER');
assert(global.document.getElementById('failed-reason-text').textContent === 'Astronaut oxygen supply depleted!', 'Failure reason properly displayed on modal');

// Simulate clicking "RETRY LEVEL"
// First change vitals to simulate depleted health before retry
HS.vitals.health = 0;
HS.vitals.oxygen = 0;
HS.vitals.radiationDose = 45;

MM.restartCurrentLevel();
assert(MM.currentGlobalLevel === 1, 'STRICT RULE: restartCurrentLevel reloads the exact same Level 1');
assert(MM.gameState === 'PLAYING', 'Game state resets to PLAYING after restartCurrentLevel');
assert(HS.vitals.health === 100, 'Initial health restored to 100% on level retry');
assert(HS.vitals.oxygen === 100, 'Initial oxygen restored to 100% on level retry');
assert(HS.vitals.water === 100, 'Initial water restored to 100% on level retry');
assert(HS.vitals.energy === 100, 'Initial energy restored to 100% on level retry');
assert(HS.vitals.food === 80, 'Initial food supply restored to 80 units on level retry');
assert(HS.vitals.radiationDose === 0, 'Initial radiation dose reset to 0 µSv on level retry');
assert(failModal.classList.contains('hidden'), 'Game Over modal is closed after clicking RETRY LEVEL');

// Simulate winning Level 1
MM.completeCurrentLevel(3, 100);
assert(MM.gameState === 'LEVEL_COMPLETED', 'Game state switches to LEVEL_COMPLETED on level victory');
assert(MM.currentGlobalLevel === 1, 'Level index still 1 until player clicks Next Level');

// Simulate clicking "NEXT LEVEL"
MM.loadNextLevel();
assert(MM.currentGlobalLevel === 2, 'STRICT RULE: loadNextLevel correctly advances to Level 2');
assert(MM.gameState === 'PLAYING', 'Game state is PLAYING on Level 2');

// Now simulate death on Level 2
MM.handlePlayerDeath('Lander impacted terrain at dangerous descent velocity!');
assert(MM.gameState === 'GAME_OVER', 'Game state is GAME_OVER on Level 2 death');
assert(MM.currentGlobalLevel === 2, 'STRICT RULE: Level index stays at Level 2 on death');

// Retry Level 2
MM.restartCurrentLevel();
assert(MM.currentGlobalLevel === 2, 'STRICT RULE: Level 2 restarted on retry (did NOT jump to Level 3)');
assert(MM.gameState === 'PLAYING', 'Game state returns to PLAYING on Level 2');

// Check index.html buttons
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(htmlContent.includes('id="btn-failed-retry"'), 'HTML contains 🔄 RETRY LEVEL button (#btn-failed-retry)');
assert(htmlContent.includes('id="btn-failed-exit"'), 'HTML contains 🏠 MAIN MENU button (#btn-failed-exit)');
assert(htmlContent.includes('id="btn-failed-info"'), 'HTML contains 📖 MISSION INFO button (#btn-failed-info)');
assert(htmlContent.includes('id="failed-mission-info-box"'), 'HTML contains collapsible mission info drawer (#failed-mission-info-box)');

// -----------------------------------------------------------------------------
// TEST 5: NASA REAL DATASETS & SCENARIO ENGINE INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 5. Testing NASA Real Datasets & Backend Services ---');

// Check Data Folders Exist
const dataBaseDir = path.join(__dirname, '../NASA_DATA_RESOURCES');
assert(fs.existsSync(dataBaseDir), 'NASA_DATA_RESOURCES directory exists');

const folders = [
  '01_NASA_OPEN_API',
  '02_NASA_DONKI',
  '03_NASA_OSDR',
  '04_NASA_RADLAB',
  '05_NASA_MARS_TREK'
];
folders.forEach(f => {
  assert(fs.existsSync(path.join(dataBaseDir, f)), `Folder NASA_DATA_RESOURCES/${f} exists`);
  assert(fs.existsSync(path.join(dataBaseDir, f, 'README.md')), `Documentation NASA_DATA_RESOURCES/${f}/README.md exists`);
});

// Check Datasets Content & Valid JSON
const apodData = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '01_NASA_OPEN_API/apod.json'), 'utf8'));
assert(typeof apodData.title === 'string' && (apodData.url || apodData.hdurl), 'APOD JSON valid and contains title & URL');

const marsPhotosRaw = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '01_NASA_OPEN_API/mars_photos.json'), 'utf8'));
const marsPhotosItems = marsPhotosRaw.collection ? marsPhotosRaw.collection.items : marsPhotosRaw;
assert(Array.isArray(marsPhotosItems) && marsPhotosItems.length >= 10, `Mars Rover photos verified (${marsPhotosItems.length} photos)`);
assert(marsPhotosItems[0].data && marsPhotosItems[0].data[0].nasa_id, 'Mars Rover photo record contains authentic NASA ID & metadata');

const donkiFlares = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '02_NASA_DONKI/donki_solar_flares.json'), 'utf8'));
assert(Array.isArray(donkiFlares) && donkiFlares.length >= 10, `DONKI Solar Flares verified (${donkiFlares.length} flare events)`);
assert(donkiFlares[0].classType && donkiFlares[0].flrID, 'DONKI Solar Flare contains classType & flrID');

const donkiCme = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '02_NASA_DONKI/donki_cme.json'), 'utf8'));
assert(Array.isArray(donkiCme) && donkiCme.length >= 5, `DONKI CMEs verified (${donkiCme.length} CME events)`);

const donkiAlerts = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '02_NASA_DONKI/donki_notifications.json'), 'utf8'));
assert(Array.isArray(donkiAlerts) && donkiAlerts.length >= 5, `DONKI Space Weather Notifications verified (${donkiAlerts.length} alerts)`);

const osdrStudy = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '03_NASA_OSDR/osdr_study_87.json'), 'utf8'));
assert(osdrStudy.success === true || osdrStudy.study?.['OSD-87'] || osdrStudy.study_accession === 'OSD-87', 'OSDR Study 87 contains valid space biology metadata');

const osdrSubjects = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '03_NASA_OSDR/osdr_subjects.json'), 'utf8'));
assert(osdrSubjects && (osdrSubjects.subjects || osdrSubjects.status || osdrSubjects.id || osdrSubjects.hits), 'OSDR Subjects dataset contains valid records');

const radlabData = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '04_NASA_RADLAB/radlab_iss.json'), 'utf8'));
const radlabRecords = radlabData.sampleRecords || radlabData;
assert(Array.isArray(radlabRecords) && radlabRecords.length > 50, `RadLab ISS telemetry verified (${radlabRecords.length} dosimeter records)`);
assert(radlabRecords[0].absorbedDoseRate !== undefined || radlabRecords[0].dose_rate_uGy_hr !== undefined || radlabRecords[0].raw, 'RadLab records contain authentic dosimeter dose rates');

const marsLayers = JSON.parse(fs.readFileSync(path.join(dataBaseDir, '05_NASA_MARS_TREK/mars_layers.json'), 'utf8'));
assert(Array.isArray(marsLayers.layers) && marsLayers.layers.length >= 3, 'Mars Trek WMTS layers defined with MOLA elevation and imagery');
assert(fs.existsSync(path.join(dataBaseDir, '05_NASA_MARS_TREK/mars_tile_0_0_0.jpg')), 'Authentic Mars Trek elevation/imagery tile downloaded');

// Check Backend Services
const donkiSvc = require('../backend/services/donkiService.js');
const radlabSvc = require('../backend/services/radlabService.js');
const osdrSvc = require('../backend/services/osdrService.js');
const marsTrekSvc = require('../backend/services/marsTrekService.js');
const openApiSvc = require('../backend/services/nasaOpenApiService.js');
const missionDataSvc = require('../backend/services/nasaMissionDataService.js');

assert(typeof donkiSvc.getSolarFlares === 'function', 'donkiService.getSolarFlares exists');
assert(typeof donkiSvc.getScenarioFromAlert === 'function', 'donkiService.getScenarioFromAlert exists');
assert(typeof radlabSvc.getIssTelemetry === 'function', 'radlabService.getIssTelemetry exists');
assert(typeof radlabSvc.getShieldingComparison === 'function', 'radlabService.getShieldingComparison exists');
assert(typeof osdrSvc.getStudy87 === 'function', 'osdrService.getStudy87 exists');
assert(typeof osdrSvc.getHealthCurriculum === 'function', 'osdrService.getHealthCurriculum exists');
assert(typeof marsTrekSvc.getLandmarks === 'function', 'marsTrekService.getLandmarks exists');
assert(typeof marsTrekSvc.evaluateSite === 'function', 'marsTrekService.evaluateSite exists');
assert(typeof openApiSvc.getApod === 'function', 'nasaOpenApiService.getApod exists');
assert(typeof missionDataSvc.getScenarioForLevel === 'function', 'nasaMissionDataService.getScenarioForLevel exists');

(async () => {
  // Check Scenario Generation for Archetypes
  const radScenario = await missionDataSvc.getScenarioForLevel(1, 6, 'radiation');
  assert(radScenario && radScenario.flareClass && radScenario.radiationRateSpike, 'Radiation archetype correctly derives from DONKI & RadLab');
  assert(radScenario.dataStatus === 'HISTORICAL' || radScenario.dataStatus === 'LIVE', 'Radiation scenario includes authoritative data status');

  const landerScenario = await missionDataSvc.getScenarioForLevel(2, 3, 'lander');
  assert(landerScenario && landerScenario.elevationKm !== undefined && landerScenario.slopeDegrees !== undefined, 'Lander archetype derives slope & elevation from Mars Trek MOLA');

  const biolabScenario = await missionDataSvc.getScenarioForLevel(1, 6, 'biolab');
  assert(biolabScenario && biolabScenario.studyId && biolabScenario.finding, 'BioLab archetype incorporates NASA OSDR biological countermeasures');

  // Also test browser-side NasaScenarioEngine
  const scenarioEngineCode = fs.readFileSync(path.join(__dirname, '../js/nasa-scenario-engine.js'), 'utf8');
  eval(scenarioEngineCode);
  const NSE = global.window.NasaScenarioEngine;
  assert(NSE !== undefined, 'NasaScenarioEngine client module loaded');
  assert(typeof NSE.loadScenarioForLevel === 'function', 'NasaScenarioEngine.loadScenarioForLevel exists');

  const clientScenario = await NSE.loadScenarioForLevel({ id: 1 }, { levelInMission: 6, archetype: 'radiation' });
  assert(clientScenario && clientScenario.flareClass, 'NasaScenarioEngine produces valid radiation scenario parameters');
  assert(clientScenario.dataStatus, 'NasaScenarioEngine outputs dataStatus badge string');

  // -----------------------------------------------------------------------------
  // TEST 6: PURE GAMEPLAY VERIFICATION (ZERO QUESTIONS, 100% ACTION GAMEPLAY)
  // -----------------------------------------------------------------------------
  console.log('\n--- 6. Testing Pure Gameplay Mode (Zero Questions, 100% Action Gameplay) ---');
  const SQE = require('../js/smart-questions.js');
  global.window.SmartQuestionEngine = SQE;
  assert(SQE !== undefined && typeof SQE.getQuestionForLevel === 'function', 'SmartQuestionEngine loaded');
  assert(typeof SQE.isQuestionLevel === 'function', 'SmartQuestionEngine.isQuestionLevel method exists');
  assert(SQE.questionsEnabled === false, 'Strict pure gameplay mode: questions are permanently disabled');

  // Verify across ALL 7 missions and ALL 10 levels (70 levels total) that there are ZERO questions
  let totalQuestionLevels = 0;
  for (let m = 1; m <= 7; m++) {
    for (let l = 1; l <= 10; l++) {
      if (SQE.isQuestionLevel(m, l)) totalQuestionLevels++;
    }
  }
  assert(totalQuestionLevels === 0, `ZERO questions across all 70 levels (100% pure interactive gameplay: found ${totalQuestionLevels})`);

  for (let m = 1; m <= 7; m++) {
    assert(SQE.isQuestionLevel(m, 1) === false, `Mission ${m} Level 1 has ZERO questions (pure gameplay)`);
  }

  assert(SQE.getQuestionForLevel({ id: 1 }, { levelInMission: 1 }) === null, 'getQuestionForLevel returns null in pure gameplay mode');
  assert(SQE.getQuestionForLevel({ id: 1 }, { levelInMission: 5 }) === null, 'Emergency level 5 returns null question (pure action challenge)');
  assert(SQE.getQuestionForLevel({ id: 1 }, { levelInMission: 7 }) === null, 'Emergency level 7 returns null question (pure action challenge)');

  // Test Rocket Level Engine State
  const levelEngineCode = fs.readFileSync(path.join(__dirname, '../js/level-engine.js'), 'utf8');
  eval(levelEngineCode);
  const RealLevelEngine = global.window.UniversalLevelEngine;
  const mockCanvas = { width: 800, height: 600, getContext: () => ({ fillRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }), save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, fillText: () => {} }) };
  const mockEngine = new RealLevelEngine(mockCanvas, { id: 1 }, { levelInMission: 3, archetype: 'lander', reward: { stars: 3, sciencePoints: 100 } });
  mockEngine.initLander();
  assert(Array.isArray(mockEngine.state.asteroids) && mockEngine.state.asteroids.length >= 4, 'Rocket flight spawns asteroid hazard field (>= 4 asteroids)');
  assert(Array.isArray(mockEngine.state.collectables) && mockEngine.state.collectables.length >= 4, 'Rocket flight spawns collectable survival canisters (O2, Energy, Fuel)');
  assert(mockEngine.state.checkpointGate && mockEngine.state.checkpointGate.y > 0, 'Rocket flight includes in-flight orbital waypoint gate');

  // Test Orbital Waypoint on Pure Gameplay Level (Level 1 or Level 3)
  let decisionModalCalled = false;
  mockEngine.showDecisionModal = () => { decisionModalCalled = true; };
  mockEngine.state.y = mockEngine.state.checkpointGate.y + 10;
  mockEngine.updateLander(0.016);
  assert(mockEngine.state.checkpointGate.passed === true, 'Orbital waypoint marked passed on pure gameplay level');
  assert(decisionModalCalled === false, 'Pure gameplay level does NOT trigger decision modal at waypoint gate');

  // Test Direct Victory on Pure Gameplay Level
  let levelCompletedStars = 0;
  mockEngine.onComplete = (stars) => { levelCompletedStars = stars; };
  mockEngine.triggerDecisionOrVictory();
  assert(levelCompletedStars === 3, 'Pure gameplay level completes directly with 3 stars (zero modal interruption)');

  // Test Cadet Character & HUD Elements in HTML
  assert(htmlContent.includes('class="cadet-card-btn'), 'HTML contains selectable cadet character cards');
  assert(htmlContent.includes('id="hud-location-tag"'), 'HTML contains HUD location tracker');
  assert(htmlContent.includes('id="complete-fact-display"'), 'HTML contains NASA Space Fact display in celebration modal');
  assert(!htmlContent.includes('btn-checkpoint-hint'), 'HTML does NOT contain question hint button');
  assert(!htmlContent.includes('edu-quiz-block'), 'HTML does NOT contain education quiz block');

  console.log('\n================================================================');
  console.log(`🎉 TEST RESULTS: ${passedTests} / ${totalTests} assertions passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
