/**
 * Frontend Mission Data Manager
 * Coordinates level telemetry, NASA datasets, and active objectives.
 */

const MissionDataManager = {
  async getLevelContext(missionData, levelData) {
    if (typeof window !== 'undefined' && window.NasaScenarioEngine) {
      return await window.NasaScenarioEngine.loadScenarioForLevel(missionData, levelData);
    }
    return {
      source: 'NASA Open Science Data',
      dataStatus: 'CACHED',
      objective: levelData?.objective || 'Complete EVA mission'
    };
  }
};

if (typeof window !== 'undefined') {
  window.MissionDataManager = MissionDataManager;
}
if (typeof module !== 'undefined') {
  module.exports = MissionDataManager;
}
