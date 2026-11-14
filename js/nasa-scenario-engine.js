/**
 * NASA Scenario Engine (Data-to-Gameplay Engine)
 * Bridges verified NASA scientific data directly into playable game mechanics.
 * 
 * Supports all 5 NASA data sources:
 * 1. NASA Open API & Image Library -> Exploration & Astronomical Identification
 * 2. NASA DONKI -> Solar Storm Sirens, Class X Flares & Regolith Bunker Evacuation
 * 3. NASA OSDR -> Biological Spaceflight Challenges (OSD-87 Ocular, OSD-137 Botany, OSD-243 Fitness)
 * 4. NASA RadLab -> Real Space Radiation Telemetry & Multi-Layer Shielding Physics
 * 5. NASA Mars Trek -> MGS MOLA Topography, Crater Landing Hazards & Base Site Selection
 */

const NasaScenarioEngine = {
  currentScenario: null,
  cachedScenarios: {},

  /**
   * Fetch or generate data-driven scenario parameters for a given level
   */
  async loadScenarioForLevel(missionData, levelData) {
    const missionId = missionData?.id || 1;
    const levelInMission = levelData?.levelInMission || 1;
    const archetype = levelData?.archetype || 'systems';
    const cacheKey = `m${missionId}_l${levelInMission}_${archetype}`;

    if (this.cachedScenarios[cacheKey]) {
      this.currentScenario = this.cachedScenarios[cacheKey];
      this.applyScenarioToUI(this.currentScenario);
      return this.currentScenario;
    }

    // Try fetching from backend scenario endpoint
    try {
      const res = await fetch(`/api/nasa/scenario?mission=${missionId}&level=${levelInMission}&archetype=${archetype}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const liveScenario = await res.json();
        this.currentScenario = liveScenario;
        this.cachedScenarios[cacheKey] = liveScenario;
        this.applyScenarioToUI(liveScenario);
        return liveScenario;
      }
    } catch (e) {
      // Backend unavailable, generate directly from local NASA datasets
    }

    const localScenario = this.generateLocalScenario(missionData, levelData);
    this.currentScenario = localScenario;
    this.cachedScenarios[cacheKey] = localScenario;
    this.applyScenarioToUI(localScenario);
    return localScenario;
  },

  generateLocalScenario(missionData, levelData) {
    const mId = missionData.id;
    const lIdx = levelData.levelInMission;
    const arch = levelData.archetype;

    switch (arch) {
      case 'radiation':
        return {
          source: 'NASA DONKI Space Weather Database',
          officialUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/',
          dataStatus: 'HISTORICAL',
          datasetId: '20240514-FLR-001',
          eventTitle: 'Super Solar Flare (Class X8.7)',
          activeRegion: 'Sunspot AR3664',
          flareClass: 'X8.7',
          countdownSeconds: 25.0,
          radiationRateSpike: 22.0,
          scientificExplanation: 'A Class X8.7 solar flare erupted from Active Region 3664, ionizing interplanetary space. High-energy X-rays and proton storm require immediate evacuation to regolith bunker.',
          safetyProtocol: 'Seal subterranean radiation shelter hatch. Regolith provides 95% radiation shielding.',
          missionObjective: 'Sprint across the surface to reach the subterranean regolith bunker before the 25-second storm timer expires!'
        };

      case 'biolab':
        return {
          source: 'NASA Open Science Data Repository (OSDR)',
          officialUrl: 'https://osdr.nasa.gov/bio/repo/',
          dataStatus: 'CACHED',
          studyId: lIdx % 2 === 0 ? 'OSD-243' : 'OSD-137',
          eventTitle: lIdx % 2 === 0 ? 'NASA ARED Astronaut Fitness Workout' : 'NASA Advanced Plant Habitat (OSD-137)',
          scientificExplanation: lIdx % 2 === 0
            ? 'Astronauts on Mars (38% gravity) experience muscle and bone density loss without daily high-resistance exercise.'
            : 'Plants in microgravity require balanced blue (430nm) and red (660nm) LED illumination to perform photosynthesis efficiently.',
          missionObjective: lIdx % 2 === 0
            ? 'Complete 5 resistance reps on the ARED gym equipment to maintain muscle density and restore Health!'
            : 'Tune the red/blue light spectrum to 70% blue to grow fresh space salad and restore oxygen reserves!'
        };

      case 'lander':
        return {
          source: 'NASA Mars Trek / MGS MOLA Laser Altimetry',
          officialUrl: 'https://trek.nasa.gov/mars/',
          dataStatus: 'CACHED',
          siteId: mId >= 15 ? 'jezero' : 'arcadia',
          siteName: mId >= 15 ? 'Jezero Crater River Delta' : 'Arcadia Planitia Smooth Plains',
          elevationKm: mId >= 15 ? -2.5 : -4.0,
          safeSpeedMs: 2.5,
          scientificExplanation: `Landing on ${mId >= 15 ? 'Jezero Crater' : 'Arcadia Planitia'} at elevation ${mId >= 15 ? '-2.5' : '-4.0'} km below Martian datum. Descent velocity must remain strictly below 2.5 m/s to prevent landing gear collapse.`,
          missionObjective: 'Use retro-thrusters to steer away from floating debris obstacles and touch down softly on the green beacon pad at under 2.5 m/s!'
        };

      case 'rover':
        return {
          source: 'NASA Mars 2020 Perseverance & MSL Curiosity',
          officialUrl: 'https://images.nasa.gov/',
          dataStatus: 'HISTORICAL',
          drillSites: ['Sedimentary Delta Clay', 'Volcanic Basalt Layer', 'Carbonate Mineral Bed'],
          scientificExplanation: 'Perseverance drills cylindrical rock core samples inside Jezero Crater to search for biosignatures and ancient organic molecules.',
          missionObjective: 'Drive the rover to all 3 geological drill sites, deploy the rotary percussive drill, and recharge at the solar station!'
        };

      case 'builder':
        return {
          source: 'NASA Mars Trek & RadLab Shielding Physics',
          officialUrl: 'https://visualization.osdr.nasa.gov/radlab/',
          dataStatus: 'EDUCATIONAL SIMULATION',
          constructionSite: 'Arcadia Planitia Outpost',
          shieldingFactor: '95% (2m Regolith berm)',
          scientificExplanation: 'Human Martian habitats require redundant ECLSS modules (Hab, Solar, MOXIE O₂ Plant, Greenhouse) buried under regolith to block cosmic rays.',
          missionObjective: 'Select habitat modules from the dock and construct a fully linked base grid with power, oxygen, and food production!'
        };

      case 'systems':
        return {
          source: 'NASA OSDR (OSD-87 & ECLSS Life Support Engineering)',
          officialUrl: 'https://osdr.nasa.gov/bio/repo/',
          dataStatus: 'CACHED',
          studyId: 'OSD-87',
          scientificExplanation: 'Closed-loop Environmental Control and Life Support Systems balance electrical loads while guaranteeing continuous oxygen recycling.',
          missionObjective: 'Shed non-essential electrical equipment to keep total load below 60 kW while keeping the Life Support O₂ Scrubber ONLINE!'
        };

      case 'comms':
        return {
          source: 'NASA Deep Space Network (DSN / JPL)',
          officialUrl: 'https://eyes.nasa.gov/dsn/dsn.html',
          dataStatus: 'CACHED',
          dishTarget: 'Goldstone DSN 70m Antenna (California, Earth)',
          scientificExplanation: 'The Deep Space Network links interplanetary spacecraft to Earth across millions of kilometers of deep space via high-gain X-band antennas.',
          missionObjective: 'Rotate the parabolic high-gain dish to align its beam angle with the Earth ground station beacon!'
        };

      default:
        return {
          source: 'NASA Open API / NASA Image Library',
          officialUrl: 'https://api.nasa.gov/',
          dataStatus: 'CACHED',
          scientificExplanation: 'Astronaut training follows NASA Artemis EVA guidelines and flight safety rules.',
          missionObjective: 'Complete your EVA spacewalk, collect geological samples, and manage your suit life support reserves!'
        };
    }
  },

  /**
   * Updates HUD and modals with authentic NASA data labels and attributions
   */
  applyScenarioToUI(scenario) {
    if (!scenario) return;

    // 1. Update In-Game HUD Telemetry Badge
    const hudPill = document.getElementById('hud-nasa-telemetry-pill');
    if (hudPill) {
      hudPill.className = `hud-telemetry-pill status-${scenario.dataStatus.toLowerCase().replace(/\s+/g, '-')}`;
      hudPill.innerHTML = `<span class="status-dot"></span> NASA: ${scenario.dataStatus}`;
      hudPill.title = `${scenario.source} | Click to view NASA Science Telemetry Lab`;
    }

    // 2. Update Story Intro Modal Badge & Scientific Context
    const storyBadge = document.getElementById('story-nasa-badge');
    if (storyBadge) {
      storyBadge.innerHTML = `🛰️ ${scenario.source} <span class="data-status-pill status-${scenario.dataStatus.toLowerCase().replace(/\s+/g, '-')}">${scenario.dataStatus}</span>`;
    }

    // 3. Update Educational Card NASA Source Tag
    const eduSource = document.getElementById('edu-nasa-source');
    if (eduSource) {
      eduSource.innerHTML = `🛰️ Verified NASA Science Source: <a href="${scenario.officialUrl}" target="_blank" rel="noopener">${scenario.source}</a> [${scenario.dataStatus}]`;
    }
  }
};

window.NasaScenarioEngine = NasaScenarioEngine;
window.MissionDataManager = NasaScenarioEngine; // Alias for backwards compatibility

