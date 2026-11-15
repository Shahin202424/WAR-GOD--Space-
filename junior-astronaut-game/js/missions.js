/**
 * Master Missions Manager
 * Coordinates exactly 7 Major Missions × 10 Levels = 70 Total Playable Levels
 * Built for 100% pure interactive gameplay, authentic NASA data, and genuine space exploration.
 * ZERO QUESTIONS • ZERO QUIZZES • PURE ACTION GAMEPLAY
 */

const MissionsManager = {
  currentGlobalLevel: 1,
  currentMissionData: null,
  currentLevelData: null,
  activeEngine: null,
  gameState: 'PLAYING', // 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_COMPLETED'

  init() {
    console.log('🌌 MissionsManager initialized for 7 Major Missions & 70 Playable Levels.');
  },

  /**
   * Launch a specific level by its global index (1 to 70)
   */
  startLevel(globalLevelIndex = 1) {
    this.currentGlobalLevel = parseInt(globalLevelIndex, 10);
    this.gameState = 'PLAYING';

    // Hide any open modals from prior state
    const failModal = document.getElementById('mission-failed-modal');
    if (failModal) failModal.classList.add('hidden');
    const completeModal = document.getElementById('level-complete-modal');
    if (completeModal) completeModal.classList.add('hidden');

    const lookup = window.getLevelByGlobalIndex
      ? window.getLevelByGlobalIndex(this.currentGlobalLevel)
      : { mission: window.MISSIONS_DATA?.[0], level: window.MISSIONS_DATA?.[0]?.levels?.[0] };

    this.currentMissionData = lookup.mission;
    this.currentLevelData = lookup.level;

    if (!this.currentMissionData || !this.currentLevelData) {
      console.error('Level data not found for index:', globalLevelIndex);
      return;
    }

    // Update HUD titles
    this.updateMissionHud();

    // Load authentic NASA scenario data for this level
    if (window.NasaScenarioEngine) {
      window.NasaScenarioEngine.loadScenarioForLevel(this.currentMissionData, this.currentLevelData);
    }

    // 1. Play the animated Story Intro Scene first (with instant Skip/Start controls)
    if (window.StoryEngine) {
      window.StoryEngine.playStory(this.currentMissionData, this.currentLevelData, () => {
        this.launchActiveGameplay();
      });
    } else {
      this.launchActiveGameplay();
    }
  },

  /**
   * Start the active canvas gameplay after story completes or is skipped
   */
  launchActiveGameplay() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    this.gameState = 'PLAYING';

    // Stop and cleanup any previous engine
    if (this.activeEngine && this.activeEngine.cleanup) {
      this.activeEngine.cleanup();
    }

    // Reset and start astronaut health simulation with initial values
    if (window.HealthSystem) {
      window.HealthSystem.resetVitals({
        health: 100,
        oxygen: 100,
        water: 100,
        energy: 100,
        radiationDose: 0,
        food: 80
      });
      window.HealthSystem.startSimulation();
    }

    // Instantiate Universal Level Engine for this level
    const EngineClass = window.UniversalLevelEngine || (typeof UniversalLevelEngine !== 'undefined' ? UniversalLevelEngine : null);
    if (EngineClass) {
      this.activeEngine = new EngineClass(
        canvas,
        this.currentMissionData,
        this.currentLevelData,
        (stars, points) => this.completeCurrentLevel(stars, points),
        (reason) => this.handlePlayerDeath(reason)
      );

      this.activeEngine.init();
    }
    if (window.AudioManager?.startSpaceMusic) {
      window.AudioManager.startSpaceMusic();
    }
  },

  updateMissionHud() {
    const m = this.currentMissionData;
    const l = this.currentLevelData;
    if (!m || !l) return;

    const elTitle = document.getElementById('hud-mission-title');
    const elObj = document.getElementById('hud-mission-objective');
    const elLevelPill = document.getElementById('hud-level-pill');
    const elLoc = document.getElementById('hud-location-tag');
    const elRadar = document.getElementById('hud-radar-telemetry');
    const elTape = document.getElementById('cockpit-telemetry-tape');

    if (elTitle) elTitle.textContent = `Mission ${m.id}: ${m.name}`;
    if (elObj) elObj.textContent = `${l.title}: ${l.objective}`;
    if (elLevelPill) elLevelPill.textContent = `Level ${this.currentGlobalLevel} of 70`;

    // Apply mission-specific theme classes (1 to 7) to active screen and HUD
    const screenPlay = document.getElementById('screen-play');
    if (screenPlay) {
      for (let i = 1; i <= 7; i++) {
        screenPlay.classList.remove(`mission-theme-${i}`);
      }
      screenPlay.classList.add(`mission-theme-${m.id}`);
      if (typeof screenPlay.setAttribute === 'function') {
        screenPlay.setAttribute('data-mission-theme', String(m.id));
      }
    }
    const hud = document.getElementById('game-hud');
    if (hud) {
      for (let i = 1; i <= 7; i++) {
        hud.classList.remove(`mission-theme-${i}`);
      }
      hud.classList.add(`mission-theme-${m.id}`);
    }

    if (elLoc) {
      switch (m.id) {
        case 1:
          elLoc.textContent = '📍 Kennedy Space Center & Deep Space • Rocket Launch Corridor';
          break;
        case 2:
          elLoc.textContent = '📍 Planetary Descent Vector • Moon / Mars Surface Touchdown';
          break;
        case 3:
          elLoc.textContent = '📍 Orbital Station Grid • Pressurized Habitat Assembly';
          break;
        case 4:
          elLoc.textContent = '📍 Station Power Truss • Photovoltaic Electrical Grid';
          break;
        case 5:
          elLoc.textContent = '📍 Station Environmental Bay • MOXIE Oxygen Plant & ECLSS';
          break;
        case 6:
          elLoc.textContent = '📍 Surface Radiation Zone • Planetary EVA Spacewalk';
          break;
        case 7:
          elLoc.textContent = '📍 Jezero Crater & Pacific Ocean • Earth Return Splashdown';
          break;
        default:
          elLoc.textContent = '📍 NASA Space Exploration Sector';
          break;
      }
    }

    // Dynamic high-tech aerospace radar telemetry
    if (elRadar) {
      const radarTelemetry = {
        1: `ASCENT: ${(120 + l.levelInMission * 14).toFixed(0)} km • V: ${(7.2 + l.levelInMission * 0.15).toFixed(2)} km/s • ORBIT LOCK`,
        2: `ALT: ${(50 - l.levelInMission * 4.5).toFixed(1)} km • V-SINK: -1.2 m/s • RADAR LOCK`,
        3: `GRID: ISS NODE-${l.levelInMission} • ALIGN: 100% • PRESSURIZED`,
        4: `SOLAR FLUX: 1361 W/m² • ARRAY ${(l.levelInMission * 10)}% • BUS: 120V`,
        5: `ECLSS: 101.3 kPa • O₂ PURITY: 99.8% • CO₂ SCRUB OK`,
        6: `RADLAB DOSIMETER: ${(15 + l.levelInMission * 8)} µSv/h • VISOR: POLARIZED`,
        7: `DSN DELAY: ${(12.4 - l.levelInMission * 1.1).toFixed(1)}m • ENTRY: 11.2 km/s • PACIFIC`
      };
      elRadar.textContent = radarTelemetry[m.id] || `RADAR: ACTIVE • SECTOR ${m.id}`;
    }

    // Cockpit Canopy telemetry tape
    if (elTape) {
      const tapeInfo = {
        1: `LAUNCH CORRIDOR • ALT ${(120 + l.levelInMission * 14)} KM • MACH ${(20 + l.levelInMission * 0.8).toFixed(1)} • T-PLUS NOMINAL`,
        2: `DESCENT RADAR • SURFACE DIST ${(50 - l.levelInMission * 4.5).toFixed(1)} KM • RETRO-THRUST READY`,
        3: `HABITAT FRAMEWORK • AIRLOCK SEALED • DOCKING PORT ACTIVE`,
        4: `PHOTOVOLTAIC ARRAY • BATTERY BUS A/B ACTIVE • GRID SYNCHRONIZED`,
        5: `LIFE SUPPORT ECLSS • CABIN 101.3 KPA • O₂ CIRCULATION NOMINAL`,
        6: `EVA SUIT VISOR HUD • COSMIC DOSIMETRY MONITORING • SHIELD READY`,
        7: `DEEP SPACE NETWORK LOCK • EARTH RE-ENTRY TRAJECTORY CONFIRMED`
      };
      elTape.textContent = tapeInfo[m.id] || `NASA ARTEMIS // FLIGHT TELEMETRY OK`;
    }
  },

  /**
   * Called when player dies, runs out of oxygen/health, falls out of map, or fails objective.
   * STRICT RULE: Never calls loadNextLevel() and never increments currentGlobalLevel!
   */
  handlePlayerDeath(reason = 'Life support reserves were critically depleted.') {
    if (this.gameState === 'GAME_OVER' || this.gameState === 'LEVEL_COMPLETED') {
      return;
    }
    this.gameState = 'GAME_OVER';

    // 1. Stop health simulation
    if (window.HealthSystem) {
      window.HealthSystem.stopSimulation();
    }

    // 2. Cleanup active game engine
    if (this.activeEngine && this.activeEngine.cleanup) {
      this.activeEngine.cleanup();
    }

    // 3. Display the GAME OVER modal for the current level
    this.showGameOver(reason);
  },

  /**
   * Display the GAME OVER / MISSION FAILED screen with:
   * 1. 🔄 RETRY LEVEL
   * 2. 📋 LEVEL MENU
   * 3. 📖 MISSION INFO
   */
  showGameOver(reason) {
    this.gameState = 'GAME_OVER';

    const modal = document.getElementById('mission-failed-modal');
    if (modal) {
      const titleEl = document.getElementById('failed-modal-title');
      if (titleEl) titleEl.textContent = 'MISSION FAILED!';

      const reasonEl = document.getElementById('failed-reason-text');
      if (reasonEl) reasonEl.textContent = reason || 'Life support reserves were critically depleted.';

      const tagEl = document.getElementById('failed-level-tag');
      if (tagEl && this.currentMissionData && this.currentLevelData) {
        tagEl.textContent = `Mission ${this.currentMissionData.id}: ${this.currentMissionData.name} — Level ${this.currentLevelData.levelInMission} (Total #${this.currentGlobalLevel}): ${this.currentLevelData.title}`;
      }

      const objEl = document.getElementById('failed-info-objective');
      if (objEl && this.currentLevelData) {
        objEl.textContent = this.currentLevelData.objective;
      }

      const nasaEl = document.getElementById('failed-info-nasa');
      if (nasaEl && this.currentMissionData && this.currentLevelData) {
        nasaEl.textContent = `${this.currentMissionData.nasaRef} (${this.currentLevelData.archetype.toUpperCase()} Protocol)`;
      }

      const infoBox = document.getElementById('failed-mission-info-box');
      if (infoBox) infoBox.classList.add('hidden');

      modal.classList.remove('hidden');
    }

    if (window.AudioManager) {
      window.AudioManager.playFailure?.();
    }

    if (window.GuideManager) {
      window.GuideManager.speak('Hang in there, Astronaut! Space exploration takes grit. Take a breath and retry this level!', 'alert');
    }
  },

  /**
   * RESTORE INITIAL VITALS & RESTART THE EXACT SAME LEVEL
   * STRICT RULE: Reloads the existing mission ID and level ID without advancing.
   */
  restartCurrentLevel() {
    const failModal = document.getElementById('mission-failed-modal');
    if (failModal) failModal.classList.add('hidden');

    const completeModal = document.getElementById('level-complete-modal');
    if (completeModal) completeModal.classList.add('hidden');

    const infoBox = document.getElementById('failed-mission-info-box');
    if (infoBox) infoBox.classList.add('hidden');

    this.gameState = 'PLAYING';

    if (this.activeEngine && this.activeEngine.cleanup) {
      this.activeEngine.cleanup();
    }

    // Restore full initial vitals
    if (window.HealthSystem) {
      window.HealthSystem.resetVitals({
        health: 100,
        oxygen: 100,
        water: 100,
        energy: 100,
        radiationDose: 0,
        food: 80
      });
      window.HealthSystem.startSimulation();
    }

    // Reload the exact same level data
    const lookup = window.getLevelByGlobalIndex
      ? window.getLevelByGlobalIndex(this.currentGlobalLevel)
      : { mission: window.MISSIONS_DATA?.[0], level: window.MISSIONS_DATA?.[0]?.levels?.[0] };

    this.currentMissionData = lookup.mission;
    this.currentLevelData = lookup.level;

    this.updateMissionHud();

    // Relaunch active gameplay directly for the same level (skipping story on retry)
    this.launchActiveGameplay();

    if (window.RewardsManager) {
      window.RewardsManager.showFloatingNotice(`🔄 Retrying Level ${this.currentGlobalLevel}: ${this.currentLevelData?.title}`);
    }
  },

  /**
   * Called only when the player successfully achieves all level objectives.
   */
  completeCurrentLevel(starsEarned = 3, pointsEarned = 100) {
    if (this.gameState === 'GAME_OVER') return;
    this.gameState = 'LEVEL_COMPLETED';

    // 1. Stop health simulation
    if (window.HealthSystem) {
      window.HealthSystem.stopSimulation();
    }

    // 2. Pure gameplay: directly celebrate level completion without any quiz screens!
    this.showLevelCelebrationModal(starsEarned, pointsEarned);
  },

  showLevelCelebrationModal(starsEarned = 3, pointsEarned = 100) {
    this.gameState = 'LEVEL_COMPLETED';

    if (window.RewardsManager) {
      window.RewardsManager.addStars(starsEarned, this.currentGlobalLevel);
      window.RewardsManager.addPoints(pointsEarned, `Completed Level ${this.currentGlobalLevel}`);
      window.RewardsManager.unlockNextLevel(this.currentGlobalLevel);

      // Check if all 10 levels of this mission are completed -> Award Mission Badge!
      if (this.currentLevelData && this.currentLevelData.levelInMission === 10) {
        window.RewardsManager.awardBadge(this.currentMissionData.badgeId, this.currentMissionData);
      }
    }

    const modal = document.getElementById('level-complete-modal');
    if (modal) {
      const isFinalLevel = this.currentGlobalLevel >= 70 || (this.currentMissionData?.id === 7 && this.currentLevelData?.levelInMission === 10);
      const titleEl = document.getElementById('complete-level-num');
      const nextBtn = document.getElementById('btn-complete-next');
      const retryBtn = document.getElementById('btn-complete-retry');

      if (isFinalLevel) {
        if (titleEl) titleEl.textContent = 'MISSION COMPLETED – RETURNED TO EARTH! 🌍';
        if (nextBtn) {
          nextBtn.textContent = '🎓 VIEW GRADUATION CERTIFICATE 👑';
          nextBtn.title = 'View Official NASA SPACE WARS Graduation Certificate';
        }
      } else {
        if (titleEl) titleEl.textContent = `LEVEL COMPLETE! (Level ${this.currentGlobalLevel} of 70)`;
        if (nextBtn) {
          nextBtn.textContent = 'NEXT LEVEL 🚀';
          nextBtn.title = 'Advance to the Next Exploration Level';
        }
      }

      if (retryBtn) {
        retryBtn.textContent = '🔄 RETRY LEVEL';
        retryBtn.title = 'Replay this level from the beginning';
      }

      const starsDisplay = document.getElementById('complete-stars-display');
      if (starsDisplay) starsDisplay.textContent = '⭐'.repeat(starsEarned);
      const pointsDisplay = document.getElementById('complete-points-display');
      if (pointsDisplay) pointsDisplay.textContent = `+${pointsEarned} Science Points!`;
      const msgDisplay = document.getElementById('complete-message-display');
      if (msgDisplay) {
        msgDisplay.textContent = isFinalLevel
          ? 'Epic Victory! You mastered all 7 Major Missions and safely returned to Earth!'
          : `Outstanding work on ${this.currentLevelData?.title || 'Mission'}!`;
      }

      // Display fun NASA space fact on the celebration screen
      const factEl = document.getElementById('complete-fact-display');
      const factText = document.getElementById('complete-fact-text');
      const fact = this.currentLevelData?.realNasaFact || this.currentLevelData?.learningCard?.spaceFact;
      if (factEl && factText && fact) {
        factText.textContent = fact;
        factEl.classList.remove('hidden');
      } else if (factEl) {
        factEl.classList.add('hidden');
      }

      modal.classList.remove('hidden');
    }

    if (window.RewardsManager) {
      window.RewardsManager.triggerConfetti();
    }
    if (window.AudioManager) {
      window.AudioManager.playCelebration();
    }
  },

  /**
   * Advances to next level.
   * STRICT RULE: Only invoked when player clicks "Next Level" on the celebration screen.
   */
  loadNextLevel() {
    const modal = document.getElementById('level-complete-modal');
    if (modal) modal.classList.add('hidden');

    const nextLvl = this.currentGlobalLevel + 1;
    if (nextLvl <= 70) {
      this.startLevel(nextLvl);
    } else {
      // Completed all 7 Major Missions & 70 Levels -> Unlock Graduation Certificate!
      if (window.GameEngine) {
        window.GameEngine.openCertificateModal();
      }
    }
  },

  // Backward compatibility aliases
  handleMissionFailed(reason) {
    this.handlePlayerDeath(reason);
  },
  onLevelComplete(stars, points) {
    this.completeCurrentLevel(stars, points);
  }
};

window.MissionsManager = MissionsManager;
if (typeof module !== 'undefined') {
  module.exports = MissionsManager;
}
