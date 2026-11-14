/**
 * Comprehensive verification script testing all 70 levels across all 7 archetypes
 */

const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
  ControlsManager: {
    reset: () => {},
    adaptForArchetype: () => {},
    isLeft: () => false,
    isRight: () => false,
    isUp: () => false,
    isDown: () => false,
    isThrust: () => false,
    isJump: () => false,
    isAction: () => false
  },
  AudioManager: {
    playChime: () => {},
    playAlarm: () => {},
    playJump: () => {},
    playClick: () => {},
    playCelebration: () => {},
    startThruster: () => {},
    stopThruster: () => {},
    startRoverMotor: () => {},
    stopRoverMotor: () => {}
  },
  HealthSystem: {
    vitals: { health: 100, oxygen: 100, radiationDose: 0, food: 80, water: 80, energy: 100 },
    updateHUD: () => {},
    performSurvivalAction: () => {},
    clearSolarStorm: () => {}
  },
  RewardsManager: {
    showFloatingNotice: () => {}
  },
  NasaScenarioEngine: {
    currentScenario: { siteName: 'Jezero Crater Delta', studyId: 'OSD-137', flareClass: 'X5.2' }
  }
};

global.document = {
  getElementById: (id) => ({
    id,
    innerHTML: '',
    textContent: '',
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    querySelectorAll: () => [],
    appendChild: () => {}
  }),
  body: {
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }
};

global.requestAnimationFrame = (cb) => 1;
global.cancelAnimationFrame = (id) => {};

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

const mockCanvas = {
  width: 800,
  height: 600,
  getContext: () => mockCtx,
  parentElement: { clientWidth: 800, clientHeight: 600 },
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
};

const missionsData = require('../data/missions-data.js');
const levelEngineCode = fs.readFileSync(path.join(__dirname, '../js/level-engine.js'), 'utf8');
eval(levelEngineCode);

const LevelEngine = global.window.UniversalLevelEngine;

console.log('================================================================');
console.log('🚀 TESTING ALL 7 MISSIONS × 10 LEVELS (70 LEVELS TOTAL)');
console.log('================================================================');

let tested = 0;
let passed = 0;

missionsData.forEach(m => {
  console.log(`\nTesting Mission ${m.id}: ${m.name}`);
  m.levels.forEach(lvl => {
    tested++;
    try {
      let completed = false;
      let failed = false;
      const engine = new LevelEngine(
        mockCanvas,
        m,
        lvl,
        () => { completed = true; },
        () => { failed = true; }
      );

      engine.init();
      // Run 5 frames of physics update
      for (let f = 0; f < 5; f++) {
        engine.update(0.016);
      }
      // Run render
      engine.render();
      engine.cleanup();

      passed++;
      console.log(`  ✓ Level ${lvl.globalLevel} [${lvl.archetype}/${lvl.subType}]: ${lvl.title} passed test`);
    } catch (err) {
      console.error(`  ✗ Level ${lvl.globalLevel} [${lvl.archetype}/${lvl.subType}]: ${lvl.title} FAILED:`, err.message);
    }
  });
});

console.log('\n================================================================');
console.log(`🏁 LEVEL ENGINE TEST COMPLETE: ${passed} / ${tested} levels verified successfully!`);
console.log('================================================================');

if (passed === 70) {
  process.exit(0);
} else {
  process.exit(1);
}

