/**
 * NASA Master Mission Data Coordinator Service
 * Aggregates all 5 NASA services into unified, data-driven mission payloads.
 */

const NasaOpenApiService = require('./nasaOpenApiService');
const DonkiService = require('./donkiService');
const OsdrService = require('./osdrService');
const RadlabService = require('./radlabService');
const MarsTrekService = require('./marsTrekService');

const NasaMissionDataService = {
  async getTelemetrySummary(apiKey = 'DEMO_KEY') {
    const [apod, donki, osdr, radlab, marsLandmarks] = await Promise.all([
      NasaOpenApiService.getApod(apiKey),
      DonkiService.getNotifications(),
      OsdrService.getStudy87(),
      RadlabService.getIssTelemetry(),
      MarsTrekService.getLandmarks()
    ]);

    return {
      timestamp: new Date().toISOString(),
      services: {
        openApi: apod,
        donki: donki,
        osdr: osdr,
        radlab: radlab,
        marsTrek: marsLandmarks
      }
    };
  },

  /**
   * Generates authentic scientific telemetry for an active level based on its archetype
   */
  async getScenarioForLevel(missionId, levelInMission, archetype) {
    let payload = {
      missionId,
      levelInMission,
      archetype,
      dataStatus: 'CACHED',
      sourceAttribution: 'NASA Open Data Repositories'
    };

    switch (archetype) {
      case 'radiation': {
        const alert = DonkiService.getScenarioFromAlert();
        payload = Object.assign(payload, {
          source: 'NASA DONKI Space Weather Database',
          officialUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
          dataStatus: 'HISTORICAL',
          datasetId: alert.messageID,
          activeRegion: alert.activeRegion,
          flareClass: alert.flareClass,
          countdownSeconds: alert.countdownSeconds,
          radiationRateSpike: alert.radiationRateSpike,
          scientificExplanation: alert.scientificExplanation,
          safetyProtocol: alert.safetyProtocol
        });
        break;
      }

      case 'biolab': {
        const curriculum = OsdrService.getHealthCurriculum();
        const study = curriculum.find(c => c.archetype === 'biolab') || curriculum[1];
        payload = Object.assign(payload, {
          source: 'NASA Open Science Data Repository (OSDR)',
          officialUrl: 'https://osdr.nasa.gov/bio/repo/',
          dataStatus: 'CACHED',
          studyId: study.studyId,
          title: study.title,
          finding: study.finding,
          gameAction: study.gameAction
        });
        break;
      }

      case 'lander': {
        const site = MarsTrekService.evaluateSite(missionId >= 15 ? 'jezero' : 'arcadia');
        payload = Object.assign(payload, {
          source: 'NASA Mars Trek / MGS MOLA Cartography',
          officialUrl: 'https://trek.nasa.gov/mars/',
          dataStatus: 'CACHED',
          siteId: site.id,
          siteName: site.name,
          elevationKm: site.elevationKm,
          slopeDegrees: site.slopeDegrees,
          landingSafety: site.landingSafety,
          scientificExplanation: `Landing in ${site.name} at elevation ${site.elevationKm} km. Safe descent speed must remain below 2.5 m/s.`
        });
        break;
      }

      case 'builder': {
        const site = MarsTrekService.evaluateSite('arcadia');
        const shields = RadlabService.getShieldingComparison();
        payload = Object.assign(payload, {
          source: 'NASA Mars Trek & RadLab Shielding Physics',
          officialUrl: 'https://visualization.osdr.nasa.gov/radlab/',
          dataStatus: 'EDUCATIONAL SIMULATION',
          constructionSite: site.name,
          recommendedModule: site.recommendedBaseModule,
          shieldingOptions: shields.materials,
          scientificExplanation: 'Habitat domes must be shielded with regolith or water-ice tanks to attenuate space radiation.'
        });
        break;
      }

      case 'systems': {
        const health = OsdrService.getHealthCurriculum()[0];
        payload = Object.assign(payload, {
          source: 'NASA OSDR (Study OSD-87 & Life Support Engineering)',
          officialUrl: 'https://osdr.nasa.gov/bio/repo/',
          dataStatus: 'CACHED',
          studyId: health.studyId,
          title: health.title,
          scientificExplanation: 'Closed-loop environmental control and life support systems (ECLSS) maintain breathable oxygen and optimal climate.'
        });
        break;
      }

      default: {
        payload = Object.assign(payload, {
          source: 'NASA Open API / NASA Image Library',
          officialUrl: 'https://api.nasa.gov/',
          dataStatus: 'CACHED',
          scientificExplanation: 'Exploration and training in accordance with NASA astronaut survival protocols.'
        });
        break;
      }
    }

    return payload;
  }
};

module.exports = NasaMissionDataService;
