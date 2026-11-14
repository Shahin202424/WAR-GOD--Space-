const fs = require('fs');
const path = require('path');

// Mock browser globals
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
console.log('Loaded missions:', missionsData.length);

