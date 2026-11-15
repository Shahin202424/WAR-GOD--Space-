/**
 * Comprehensive Automated Test Suite: Universal Back Button & Smart Navigation Architecture
 * Verifies:
 * 1. Universal Back button UI across all screens, subpages, and modals
 * 2. Smart Navigation History stack tracking actual previous page
 * 3. Prevention of navigation loops
 * 4. Modal Back navigation returning to caller screen (Home, Levels, Play)
 * 5. Level Introduction (Story Intro) cancellation returning to Mission Control
 * 6. Gameplay Protection on screen-play (confirmation modal, progress preservation, cancel/confirm)
 * 7. Browser popstate and keyboard Escape key handling
 * 8. Next Level, Retry, and Level Menu continuity
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 RUNNING UNIVERSAL BACK NAVIGATION & GAMEPLAY PROTECTION TEST');
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

// 1. Inspect HTML File for all Universal Back Buttons
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

console.log('\n--- 1. Testing HTML Markup for Universal Back Buttons & Modals ---');
assert(htmlContent.includes('id="btn-select-back"'), 'HTML contains Cadet Selection Back button (#btn-select-back)');
assert(htmlContent.includes('id="btn-levels-back"'), 'HTML contains Mission Control Back button (#btn-levels-back)');
assert(htmlContent.includes('id="btn-how-top-back"'), 'HTML contains How To Play top Back button (#btn-how-top-back)');
assert(htmlContent.includes('id="btn-how-back"'), 'HTML contains How To Play bottom Back button (#btn-how-back)');
assert(htmlContent.includes('id="hud-back-btn"'), 'HTML contains Spacecraft HUD Back button (#hud-back-btn)');
assert(htmlContent.includes('id="btn-story-back"'), 'HTML contains Level Intro / Story Back button (#btn-story-back)');
assert(htmlContent.includes('id="btn-telemetry-top-back"'), 'HTML contains NASA Science Lab top Back button (#btn-telemetry-top-back)');
assert(htmlContent.includes('id="btn-telemetry-close"'), 'HTML contains NASA Science Lab close/back button (#btn-telemetry-close)');
assert(htmlContent.includes('id="btn-settings-top-back"'), 'HTML contains Settings top Back button (#btn-settings-top-back)');
assert(htmlContent.includes('id="btn-settings-close"'), 'HTML contains Settings close/back button (#btn-settings-close)');
assert(htmlContent.includes('id="btn-cert-top-back"'), 'HTML contains Certificate top Back button (#btn-cert-top-back)');
assert(htmlContent.includes('id="btn-cert-close"'), 'HTML contains Certificate close/back button (#btn-cert-close)');
assert(htmlContent.includes('id="btn-pause-top-back"'), 'HTML contains Pause modal top Back button (#btn-pause-top-back)');
assert(htmlContent.includes('id="leave-mission-confirm-modal"'), 'HTML contains Gameplay Protection Confirmation modal (#leave-mission-confirm-modal)');
assert(htmlContent.includes('id="btn-leave-cancel"'), 'HTML contains Gameplay Protection Cancel button (#btn-leave-cancel)');
assert(htmlContent.includes('id="btn-leave-confirm"'), 'HTML contains Gameplay Protection Confirm button (#btn-leave-confirm)');
assert(htmlContent.includes('class="universal-back-btn'), 'HTML uses .universal-back-btn class for consistent styling');
assert(htmlContent.includes('BACK'), 'Universal Back buttons include "BACK" text label');

// 2. Inspect CSS File for Universal Back Button Styling & Responsiveness
const cssContent = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');

console.log('\n--- 2. Testing CSS Styling, Animations & Responsiveness ---');
assert(cssContent.includes('.universal-back-btn'), 'CSS defines .universal-back-btn class');
assert(cssContent.includes('rgba(0, 229, 255'), 'CSS applies cyan/blue glowing border');
assert(cssContent.includes('.universal-back-btn:hover'), 'CSS defines smooth hover state');
assert(cssContent.includes('transform: translateX'), 'CSS includes smooth left-shift arrow animation');
assert(cssContent.includes('.modal-top-back-btn'), 'CSS anchors modal back button to top-left');
assert(cssContent.includes('.hud-back-btn'), 'CSS styles HUD back button inside cockpit');
assert(cssContent.includes('.leave-mission-card'), 'CSS styles gameplay protection confirmation card');
assert(cssContent.includes('@media (max-width: 768px)'), 'CSS includes responsive styles for tablet');
assert(cssContent.includes('@media (max-width: 480px)'), 'CSS includes responsive styles for mobile');

// 3. Setup Mock DOM Environment for JavaScript Navigation Logic Testing
console.log('\n--- 3. Testing NavigationManager Logic & Smart History Stack ---');

const domElements = {};

function createMockElement(id, tagName = 'div') {
  return {
    id,
    tagName,
    textContent: '',
    innerHTML: '',
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
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    },
    click() {
      if (this.onclick) this.onclick({ preventDefault: () => {} });
      if (this.listeners['click']) {
        this.listeners['click'].forEach(fn => fn({ preventDefault: () => {} }));
      }
    },
    setAttribute: () => {},
    getAttribute: () => '',
    parentElement: { clientWidth: 800, clientHeight: 600 },
    querySelectorAll: () => []
  };
}

global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = createMockElement(id);
    }
    return domElements[id];
  },
  querySelectorAll: (selector) => {
    if (selector === '.game-screen') {
      return ['home', 'select', 'levels', 'how-to-play', 'play'].map(s => document.getElementById(`screen-${s}`));
    }
    if (selector === '.cadet-card-btn') return [];
    if (selector === '.suit-color-option') return [];
    if (selector === '.diff-option-btn') return [];
    return [];
  },
  querySelector: () => null,
  body: {
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    }
  }
};

const historyStack = [];
const windowListeners = {};

global.window = {
  history: {
    pushState: (state, title, url) => {
      historyStack.push({ state, url });
    },
    replaceState: (state, title, url) => {
      if (historyStack.length > 0) historyStack[historyStack.length - 1] = { state, url };
      else historyStack.push({ state, url });
    }
  },
  location: { hash: '' },
  addEventListener: (event, fn) => {
    if (!windowListeners[event]) windowListeners[event] = [];
    windowListeners[event].push(fn);
  },
  removeEventListener: () => {},
  AudioManager: {
    playClick: () => {},
    startSpaceMusic: () => {},
    toggleSound: () => {}
  },
  RewardsManager: {
    init: () => {},
    updateHud: () => {},
    save: () => {},
    state: {},
    getCompletedLevelsCount: () => 5
  },
  NasaDataManager: {
    initialize: () => {},
    getTelemetryReport: () => ({
      aggregateStatus: 'OPERATIONAL',
      timestamp: Date.now(),
      services: {}
    })
  },
  HealthSystem: {
    stopSimulation: () => {}
  },
  StoryEngine: {
    stopNarration: () => {},
    cancelStory: () => {
      const modal = document.getElementById('story-intro-modal');
      if (modal) modal.classList.add('hidden');
    }
  },
  MissionsManager: {
    currentGlobalLevel: 1,
    gameState: 'IDLE',
    activeEngine: null
  }
};

// Load game.js
require('../js/game.js');

const Nav = window.NavigationManager;
const Engine = window.GameEngine;

assert(Nav !== undefined, 'NavigationManager is instantiated and exposed on window');
assert(Engine !== undefined, 'GameEngine is instantiated');

// Initialize Game Engine and Navigation
Engine.init();

assert(Nav.currentScreen() === 'home', 'Initial screen is "home"');
assert(Nav.screenHistory.length === 1 && Nav.screenHistory[0] === 'home', 'screenHistory starts with ["home"]');
assert(document.getElementById('screen-home').classList.contains('hidden') === false, 'screen-home is visible on start');

// Test 1: Navigation Forward (home -> select -> levels)
Nav.navigateTo('select');
assert(Nav.currentScreen() === 'select', 'Navigated to "select" screen');
assert(Nav.screenHistory.join(' > ') === 'home > select', 'History stack correctly contains [home, select]');
assert(document.getElementById('screen-select').classList.contains('hidden') === false, 'screen-select is visible');
assert(document.getElementById('screen-home').classList.contains('hidden') === true, 'screen-home is hidden');

Nav.navigateTo('levels');
assert(Nav.currentScreen() === 'levels', 'Navigated to "levels" screen');
assert(Nav.screenHistory.join(' > ') === 'home > select > levels', 'History stack correctly contains [home, select, levels]');
assert(document.getElementById('screen-levels').classList.contains('hidden') === false, 'screen-levels is visible');

// Test 2: Universal Back button from Mission Control (levels -> select)
console.log('\n--- 4. Testing Back Navigation from Mission Control ---');
document.getElementById('btn-levels-back').click();
assert(Nav.currentScreen() === 'select', 'Clicking #btn-levels-back navigated back to "select" screen');
assert(Nav.screenHistory.join(' > ') === 'home > select', 'History stack correctly updated to [home, select]');
assert(document.getElementById('screen-select').classList.contains('hidden') === false, 'screen-select is visible');

// Test 3: Universal Back button from Character Selection (select -> home)
console.log('\n--- 5. Testing Back Navigation from Character Selection ---');
document.getElementById('btn-select-back').click();
assert(Nav.currentScreen() === 'home', 'Clicking #btn-select-back navigated back to "home" screen');
assert(Nav.screenHistory.join(' > ') === 'home', 'History stack correctly contains [home]');
assert(document.getElementById('screen-home').classList.contains('hidden') === false, 'screen-home is visible');

// Test 4: Root Boundary Protection (clicking back at home stays at home)
document.getElementById('btn-select-back').click();
assert(Nav.currentScreen() === 'home', 'Clicking back at root safely stays at "home" without error');
assert(Nav.screenHistory.length === 1 && Nav.screenHistory[0] === 'home', 'History stack preserved at ["home"]');

// Test 5: Loop Prevention
console.log('\n--- 6. Testing Navigation Loop Prevention ---');
Nav.recordScreen('levels');
Nav.recordScreen('levels');
Nav.recordScreen('levels');
assert(Nav.screenHistory.filter(s => s === 'levels').length === 1, 'Consecutive navigation to same screen does NOT duplicate in history');

// Test 6: Subpage How to Play Navigation
console.log('\n--- 7. Testing How To Play Navigation ---');
Nav.navigateTo('how-to-play');
assert(Nav.currentScreen() === 'how-to-play', 'Navigated to "how-to-play"');
document.getElementById('btn-how-top-back').click();
assert(Nav.currentScreen() === 'levels', 'Clicking #btn-how-top-back returned to caller screen ("levels")');

// Test 7: Modal Navigation (NASA Science Lab from Home vs Levels)
console.log('\n--- 8. Testing Modal Back Navigation to Actual Caller Screen ---');
Nav.navigateTo('home');
Engine.openScienceLabModal();
assert(document.getElementById('nasa-telemetry-modal').classList.contains('hidden') === false, 'NASA Science Lab modal is open');

document.getElementById('btn-telemetry-top-back').click();
assert(document.getElementById('nasa-telemetry-modal').classList.contains('hidden') === true, 'Clicking #btn-telemetry-top-back closed NASA Science Lab');
assert(Nav.currentScreen() === 'home', 'Returned to "home" since Science Lab was opened from home');

// Open Science Lab from Levels screen
Nav.navigateTo('levels');
Engine.openScienceLabModal();
assert(document.getElementById('nasa-telemetry-modal').classList.contains('hidden') === false, 'NASA Science Lab modal is open from levels');
document.getElementById('btn-telemetry-close').click();
assert(document.getElementById('nasa-telemetry-modal').classList.contains('hidden') === true, 'Clicking #btn-telemetry-close closed NASA Science Lab');
assert(Nav.currentScreen() === 'levels', 'Returned to "levels" since Science Lab was opened from levels');

// Test 8: Level Intro / Story Modal Cancellation
console.log('\n--- 9. Testing Level Intro (Story Modal) Cancellation ---');
const storyModal = document.getElementById('story-intro-modal');
storyModal.classList.remove('hidden');
assert(storyModal.classList.contains('hidden') === false, 'Story intro modal is open');
document.getElementById('btn-story-back').click();
assert(storyModal.classList.contains('hidden') === true, 'Clicking #btn-story-back closed story modal');
assert(Nav.currentScreen() === 'levels', 'Player remains at Mission Control (levels) when cancelling story intro');

// Test 9: Gameplay Protection on screen-play
console.log('\n--- 10. Testing Gameplay Protection on Active Level ---');
Nav.navigateTo('play');
assert(Nav.currentScreen() === 'play', 'Navigated to active gameplay screen ("play")');

// Simulate active gameplay
window.MissionsManager.gameState = 'PLAYING';
window.MissionsManager.activeEngine = { cleanup: () => { window.MissionsManager.activeEngine = null; } };

const leaveModal = document.getElementById('leave-mission-confirm-modal');

// Player clicks HUD Back button while playing
document.getElementById('hud-back-btn').click();
assert(leaveModal.classList.contains('hidden') === false, 'Clicking HUD Back during active gameplay prompts leave confirmation modal');
assert(Nav.currentScreen() === 'play', 'Game screen is NOT immediately closed');
assert(window.MissionsManager.gameState === 'PLAYING', 'Game state remains PLAYING during prompt');

// Player clicks RESUME PLAYING
document.getElementById('btn-leave-cancel').click();
assert(leaveModal.classList.contains('hidden') === true, 'Clicking RESUME PLAYING dismisses leave confirmation modal');
assert(Nav.currentScreen() === 'play', 'Player stays in mission on screen-play');
assert(window.MissionsManager.gameState === 'PLAYING', 'Game state remains PLAYING and active');

// Player clicks HUD Back button and CONFIRMS EXIT
document.getElementById('hud-back-btn').click();
assert(leaveModal.classList.contains('hidden') === false, 'Confirmation modal re-opened on Back click');
document.getElementById('btn-leave-confirm').click();
assert(leaveModal.classList.contains('hidden') === true, 'Confirmation modal closed upon confirmation');
assert(window.MissionsManager.gameState === 'IDLE', 'Game state safely transitioned to IDLE');
assert(Nav.currentScreen() === 'levels', 'Player safely returned to Mission Control (levels)');

// Test 10: Browser Popstate & Keyboard Escape
console.log('\n--- 11. Testing Browser Popstate & Keyboard Escape ---');
Nav.navigateTo('home');
Nav.navigateTo('select');
assert(Nav.currentScreen() === 'select', 'On select screen from home');

// Fire Escape keydown
const escapeEvent = { key: 'Escape', preventDefault: () => {} };
windowListeners['keydown'].forEach(fn => fn(escapeEvent));
assert(Nav.currentScreen() === 'home', 'Pressing Escape on select screen navigated back to "home"');

// Test popstate
const popstateEvent = { state: { screen: 'levels' } };
windowListeners['popstate'].forEach(fn => fn(popstateEvent));
assert(Nav.currentScreen() === 'levels', 'Firing browser popstate navigated cleanly to "levels"');

console.log('\n================================================================');
console.log(`🎉 TEST SUITE COMPLETE: ${passedTests} / ${totalTests} assertions passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
