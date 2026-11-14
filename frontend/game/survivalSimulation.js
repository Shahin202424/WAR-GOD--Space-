/**
 * Frontend Survival Simulation Wrapper
 * Monitors astronaut life support vitals: Health, Oxygen, Water, Energy, Food, Radiation.
 */

const SurvivalSimulation = {
  getVitals() {
    return (typeof window !== 'undefined' && window.HealthSystem) ? window.HealthSystem.vitals : {
      health: 100,
      oxygen: 100,
      water: 100,
      energy: 100,
      radiationDose: 0,
      food: 80
    };
  },

  performAction(actionId) {
    if (typeof window !== 'undefined' && window.HealthSystem) {
      return window.HealthSystem.performSurvivalAction(actionId);
    }
    return false;
  }
};

if (typeof window !== 'undefined') {
  window.SurvivalSimulation = SurvivalSimulation;
}
if (typeof module !== 'undefined') {
  module.exports = SurvivalSimulation;
}

