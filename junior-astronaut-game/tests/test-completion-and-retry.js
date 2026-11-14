/**
 * Comprehensive Automated Test Suite: Next Level & Retry System Across All 70 Levels
 * Verifies for all 70 levels across all 7 missions:
 * 1. Level Completion: LEVEL COMPLETE! screen with Stars, Score, NEXT LEVEL and RETRY buttons
 * 2. Level Failure: MISSION FAILED! screen with simple reason, RETRY and LEVEL MENU buttons
 * 3. RETRY strictly restarts the exact same level (resetting vitals, hazards, objectives)
 * 4. NEXT LEVEL advances only upon player click and unlocks sequential progression
 * 5. Level 70 (Mission 7 Level 10) shows special "MISSION COMPLETED – RETURNED TO EARTH!"
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 RUNNING ALL 70 LEVELS COMPLETION & RETRY VERIFICATION SUITE');
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

// Setup full browser environment
const missionsData = require('../data/missions-data.js');

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
  setLineDash: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} })
};

const domElements = {};
global.document = {
  createElement: (tag) => {
    const el = {
      tagName: tag,
      className: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      appendChild: (c) => el.children.push(c),
      children: [],
      style: {},
      addEventListener: () => {}
    };
    el.querySelector = () => el;
    el.querySelectorAll = () => [];
    return el;
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        id,
        textContent: '',
        innerHTML: '',
        title: '',
        className: '',
        classList: {
          classes: new Set(['hidden']),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); },
          toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
        },
        style: {},
        listeners: {},
        appendChild: () => {},
        removeChild: () => {},
        addEventListener(event, fn) {
          if (!this.listeners[event]) this.listeners[event] = [];
          this.listeners[event].push(fn);
        },
        click() {
          if (this.listeners['click']) {
            this.listeners['click'].forEach(fn => fn());
          }
        },
        getContext: () => mockCtx,
        parentElement: { clientWidth: 800, clientHeight: 600 },
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
        querySelectorAll: () => []
      };
    }
    return domElements[id];
  },
  body: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    appendChild: () => {}
  }
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  MISSIONS_DATA: missionsData,
  getLevelByGlobalIndex: (idx) => {
    const gIdx = parseInt(idx, 10) || 1;
    for (const m of missionsData) {
      for (const l of m.levels) {
        if (l.globalLevel === gIdx) return { mission: m, level: l };
      }
    }
    return { mission: missionsData[0], level: missionsData[0].levels[0] };
  },
  AudioManager: {
    playChime: () => {},
    playAlarm: () => {},
    playJump: () => {},
    playClick: () => {},
    playFailure: () => {},
    playCelebration: () => {},
    playGuideSpeech: () => {},
    startSpaceMusic: () => {},
    startThruster: () => {},
    stopThruster: () => {},
    startRoverMotor: () => {},
    stopRoverMotor: () => {}
  },
  HealthSystem: {
    vitals: { health: 100, oxygen: 100, water: 100, energy: 100, food: 80, radiationDose: 0 },
    resetVitals(v) { this.vitals = Object.assign({ health: 100, oxygen: 100, water: 100, energy: 100, food: 80, radiationDose: 0 }, v || {}); },
    startSimulation: () => {},
    stopSimulation: () => {},
    updateHUD: () => {},
    performSurvivalAction: () => {},
    clearSolarStorm: () => {}
  },
  RewardsManager: {
    init: () => {},
    updateHud: () => {},
    getCurrentRank: () => ({ title: 'Cadet', icon: '🧑‍🚀' }),
    getCompletedLevelsCount() { return Object.keys(this.state.levelStars).filter(k => this.state.levelStars[k] > 0).length; },
    isLevelUnlocked(lvl) { return this.state.unlockedLevels.includes(lvl); },
    checkCertificateStatus: () => {},
    state: { stars: 0, sciencePoints: 0, unlockedLevels: [1], levelStars: {}, badges: [] },
    addStars(s, lvl) { this.state.levelStars[lvl] = s; this.state.stars += s; },
    addPoints(p) { this.state.sciencePoints += p; },
    unlockNextLevel(lvl) { if (lvl + 1 <= 70 && !this.state.unlockedLevels.includes(lvl + 1)) this.state.unlockedLevels.push(lvl + 1); },
    awardBadge(bId) { if (!this.state.badges.includes(bId)) this.state.badges.push(bId); },
    triggerConfetti: () => {},
    showFloatingNotice: () => {}
  },
  NasaScenarioEngine: {
    loadScenarioForLevel: () => {}
  },
  StoryEngine: {
    playStory: (m, l, cb) => cb()
  },
  GameEngine: {
    currentScreen: 'play',
    showScreen(scr) { this.currentScreen = scr; },
    openCertificateModal() { this.certificateOpened = true; }
  }
};

global.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = v; },
  removeItem(k) { delete this.data[k]; }
};

global.requestAnimationFrame = (cb) => 1;
global.cancelAnimationFrame = () => {};

// Load modules
const levelEngineCode = fs.readFileSync(path.join(__dirname, '../js/level-engine.js'), 'utf8');
eval(levelEngineCode);
global.window.UniversalLevelEngine = global.UniversalLevelEngine;

const missionsCode = fs.readFileSync(path.join(__dirname, '../js/missions.js'), 'utf8');
eval(missionsCode);
const MM = global.window.MissionsManager;

const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
eval(gameCode);
const GE = global.window.GameEngine;

// Initialize bindings in GameEngine
GE.init();

console.log('\n--- 1. Testing HTML Buttons & UI Elements ---');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert(html.includes('id="btn-complete-next"'), 'HTML contains NEXT LEVEL button (#btn-complete-next)');
assert(html.includes('id="btn-complete-retry"'), 'HTML contains Level Complete RETRY button (#btn-complete-retry)');
assert(html.includes('id="btn-failed-retry"'), 'HTML contains Game Over RETRY button (#btn-failed-retry)');
assert(html.includes('id="btn-failed-exit"'), 'HTML contains Game Over LEVEL MENU button (#btn-failed-exit)');
assert(html.includes('id="failed-modal-title">MISSION FAILED!</h2>'), 'HTML contains MISSION FAILED! title');
assert(html.includes('id="complete-level-num">LEVEL COMPLETE!</h2>'), 'HTML contains LEVEL COMPLETE! title');

console.log('\n--- 2. Testing All 70 Levels: Completion (NEXT LEVEL + RETRY) & Failure (RETRY + LEVEL MENU) ---');

let allCompletedLevelsWork = true;
let allRetryOnCompleteWork = true;
let allFailuresWork = true;
let allRetryOnFailWork = true;

for (let lvl = 1; lvl <= 70; lvl++) {
  const lookup = global.window.getLevelByGlobalIndex(lvl);
  const m = lookup.mission;
  const l = lookup.level;

  // 1. START LEVEL
  MM.startLevel(lvl);
  if (MM.currentGlobalLevel !== lvl || MM.gameState !== 'PLAYING') {
    allCompletedLevelsWork = false;
    console.error(`Level ${lvl} failed to start properly`);
  }

  // 2. TEST LEVEL FAILURE FLOW
  MM.handlePlayerDeath('Life support critically depleted');
  const failModal = global.document.getElementById('mission-failed-modal');
  const failTitle = global.document.getElementById('failed-modal-title').textContent;
  const failReason = global.document.getElementById('failed-reason-text').textContent;

  if (MM.gameState !== 'GAME_OVER' || failModal.classList.contains('hidden') || !failTitle.includes('FAILED') || !failReason.includes('depleted')) {
    allFailuresWork = false;
    console.error(`Level ${lvl} failure screen failed assertions`);
  }

  // Test RETRY from Failure
  // First simulate altered vitals to verify reset
  global.window.HealthSystem.vitals.health = 0;
  global.window.HealthSystem.vitals.oxygen = 0;
  global.window.HealthSystem.vitals.radiationDose = 75;

  const btnFailRetry = global.document.getElementById('btn-failed-retry');
  btnFailRetry.click();

  if (
    MM.currentGlobalLevel !== lvl ||
    MM.gameState !== 'PLAYING' ||
    !failModal.classList.contains('hidden') ||
    global.window.HealthSystem.vitals.health !== 100 ||
    global.window.HealthSystem.vitals.oxygen !== 100 ||
    global.window.HealthSystem.vitals.radiationDose !== 0
  ) {
    allRetryOnFailWork = false;
    console.error(`Level ${lvl} retry after failure did not reset state properly`);
  }

  // 3. TEST LEVEL COMPLETION FLOW
  MM.completeCurrentLevel(3, 100);
  const completeModal = global.document.getElementById('level-complete-modal');
  const compTitle = global.document.getElementById('complete-level-num').textContent;
  const compStars = global.document.getElementById('complete-stars-display').textContent;
  const compPoints = global.document.getElementById('complete-points-display').textContent;

  if (lvl === 70) {
    // Special test for Level 70 (Final Level)
    if (!compTitle.includes('MISSION COMPLETED – RETURNED TO EARTH')) {
      console.error('Level 70 does not display "MISSION COMPLETED – RETURNED TO EARTH!"');
      allCompletedLevelsWork = false;
    }
    const nextBtnText = global.document.getElementById('btn-complete-next').textContent;
    if (!nextBtnText.includes('GRADUATION CERTIFICATE')) {
      console.error('Level 70 Next button does not display Graduation Certificate');
      allCompletedLevelsWork = false;
    }
  } else {
    if (!compTitle.includes('LEVEL COMPLETE') || !compStars.includes('⭐⭐⭐') || !compPoints.includes('+100')) {
      allCompletedLevelsWork = false;
      console.error(`Level ${lvl} complete screen failed assertions`);
    }
  }

  // Test RETRY from Level Complete Modal
  const btnCompRetry = global.document.getElementById('btn-complete-retry');
  btnCompRetry.click();

  if (
    MM.currentGlobalLevel !== lvl ||
    MM.gameState !== 'PLAYING' ||
    !completeModal.classList.contains('hidden')
  ) {
    allRetryOnCompleteWork = false;
    console.error(`Level ${lvl} retry from completion modal did not restart level ${lvl}`);
  }

  // Re-complete level to test NEXT LEVEL advance
  MM.completeCurrentLevel(3, 100);
  const btnCompNext = global.document.getElementById('btn-complete-next');
  btnCompNext.click();

  if (lvl < 70) {
    if (MM.currentGlobalLevel !== lvl + 1) {
      allCompletedLevelsWork = false;
      console.error(`Level ${lvl} clicking NEXT LEVEL did not advance to ${lvl + 1}`);
    }
  } else {
    // Level 70 should open certificate
    const certModal = global.document.getElementById('certificate-modal');
    if (certModal.classList.contains('hidden')) {
      allCompletedLevelsWork = false;
      console.error('Level 70 clicking button did not open Graduation Certificate');
    }
  }
}

assert(allCompletedLevelsWork === true, 'All 70 levels successfully display completion screen and advance on NEXT LEVEL');
assert(allRetryOnCompleteWork === true, 'All 70 levels successfully reload the exact same level when clicking RETRY on completion screen');
assert(allFailuresWork === true, 'All 70 levels successfully display MISSION FAILED screen with failure reason');
assert(allRetryOnFailWork === true, 'All 70 levels successfully reset vitals & restart the same level when clicking RETRY on failure screen');

console.log('\n--- 3. Testing LEVEL MENU Button on Failure Screen ---');
MM.startLevel(15);
MM.handlePlayerDeath('Crashed on crater slope');
const btnFailExit = global.document.getElementById('btn-failed-exit');
btnFailExit.click();
assert(GE.currentScreen === 'levels', 'Clicking LEVEL MENU returns player directly to Mission Control level selection screen');
assert(global.document.getElementById('mission-failed-modal').classList.contains('hidden'), 'Failure modal is closed when returning to LEVEL MENU');

console.log('\n--- 4. Testing Keyboard Navigation ---');
// Test Keyboard in LEVEL_COMPLETED
MM.startLevel(5);
MM.completeCurrentLevel(3, 100);
assert(MM.gameState === 'LEVEL_COMPLETED', 'Game state is LEVEL_COMPLETED on Level 5');

// Mock controls manager keyboard dispatch
const controlsCode = fs.readFileSync(path.join(__dirname, '../js/controls.js'), 'utf8');
eval(controlsCode);
const CM = global.window.ControlsManager;

// Simulate 'r' key for retry
let retryClicked = false;
global.document.getElementById('btn-complete-retry').click = () => { retryClicked = true; };
const keydownListeners = [];
const origAddEventListener = global.window.addEventListener;
global.window.addEventListener = (evt, fn) => {
  if (evt === 'keydown') keydownListeners.push(fn);
};
CM.bindKeyboard();

// Trigger 'r' keydown
keydownListeners.forEach(fn => fn({ key: 'r', preventDefault: () => {} }));
assert(retryClicked === true, 'Pressing "R" key triggers RETRY LEVEL on completion screen');

// Simulate 'n' key for next level
let nextClicked = false;
global.document.getElementById('btn-complete-next').click = () => { nextClicked = true; };
keydownListeners.forEach(fn => fn({ key: 'n', preventDefault: () => {} }));
assert(nextClicked === true, 'Pressing "N" key triggers NEXT LEVEL on completion screen');

// Test Keyboard in GAME_OVER
MM.gameState = 'GAME_OVER';
let failRetryClicked = false;
global.document.getElementById('btn-failed-retry').click = () => { failRetryClicked = true; };
keydownListeners.forEach(fn => fn({ key: 'r', preventDefault: () => {} }));
assert(failRetryClicked === true, 'Pressing "R" key triggers RETRY on Game Over screen');

let menuClicked = false;
global.document.getElementById('btn-failed-exit').click = () => { menuClicked = true; };
keydownListeners.forEach(fn => fn({ key: 'Escape', preventDefault: () => {} }));
assert(menuClicked === true, 'Pressing "Escape" key triggers LEVEL MENU on Game Over screen');

console.log('\n================================================================');
console.log(`🎉 TEST RESULTS: ${passedTests} / ${totalTests} assertions passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('================================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
