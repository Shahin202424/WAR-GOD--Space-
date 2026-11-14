/**
 * Frontend NASA Scenario Engine
 * Generates verified, data-driven parameters from real NASA datasets.
 */

if (typeof window !== 'undefined' && window.NasaScenarioEngine) {
  module.exports = window.NasaScenarioEngine;
} else if (typeof require !== 'undefined') {
  try {
    module.exports = require('../../backend/services/nasaMissionDataService');
  } catch (e) {
    module.exports = {};
  }
}

