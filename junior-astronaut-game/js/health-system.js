/**
 * Astronaut Health & Resource Survival Monitoring System
 * Educational real-time life support simulation:
 * - Health (0-100%)
 * - Oxygen (0-100%)
 * - Water (0-100%)
 * - Energy (0-100%)
 * - Radiation Exposure (accumulated dose in µSv / mGy)
 * - Food Supply (available units)
 * 
 * Note: Educational gameplay simulation inspired by NASA life support systems;
 * not a medical prediction or real medical device.
 */

const HealthSystem = {
  // Current Astronaut Vitals
  vitals: {
    health: 100,
    oxygen: 100,
    water: 100,
    energy: 100,
    radiationDose: 0, // accumulated dose in µSv
    doseRate: 0.22,   // current rate µGy/min (ISS reference baseline)
    food: 80
  },

  // Environmental and Active Modifiers
  modifiers: {
    inShelter: false,
    solarActive: true,
    o2RecyclerWorking: true,
    waterRecyclerWorking: true,
    radiationEventActive: false,
    radiationSpikeRate: 0,
    suitLeak: false,
    difficultyMultiplier: 1.0 // 0.6 for Easy, 1.0 for Scientist, 1.4 for Commander
  },

  isRunning: false,
  timerInterval: null,
  callbacks: {
    onCriticalAlert: null,
    onHealthDepleted: null
  },

  init() {
    this.resetVitals();
    this.updateHUD();
  },

  setDifficulty(diffName) {
    if (diffName === 'easy') this.modifiers.difficultyMultiplier = 0.6;
    else if (diffName === 'hard') this.modifiers.difficultyMultiplier = 1.4;
    else this.modifiers.difficultyMultiplier = 1.0;
  },

  resetVitals(customInit = null) {
    this.vitals = Object.assign({
      health: 100,
      oxygen: 100,
      water: 100,
      energy: 100,
      radiationDose: 0,
      doseRate: 0.22,
      food: 80
    }, customInit || {});

    this.modifiers.inShelter = false;
    this.modifiers.radiationEventActive = false;
    this.modifiers.radiationSpikeRate = 0;
    this.modifiers.suitLeak = false;

    this.updateHUD();
  },

  startSimulation() {
    this.isRunning = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isRunning && !window.GameEngine?.isPaused) {
        this.tick(1.0); // 1-second simulation step
      }
    }, 1000);
  },

  stopSimulation() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  tick(deltaSeconds = 1.0) {
    const diff = this.modifiers.difficultyMultiplier;

    // 1. Oxygen consumption
    let o2Drain = (0.28 * diff) * deltaSeconds;
    if (this.modifiers.suitLeak) o2Drain *= 2.5;
    if (!this.modifiers.o2RecyclerWorking) o2Drain *= 1.5;
    this.vitals.oxygen = Math.max(0, this.vitals.oxygen - o2Drain);
    if (this.vitals.oxygen <= 0) {
      this.triggerOxygenDepleted();
      return;
    }

    // 2. Water consumption
    let waterDrain = (0.22 * diff) * deltaSeconds;
    if (!this.modifiers.waterRecyclerWorking) waterDrain *= 1.4;
    this.vitals.water = Math.max(0, this.vitals.water - waterDrain);

    // 3. Energy dynamics: generation vs drain
    let energyGen = (this.modifiers.solarActive ? 0.35 : 0.05) * deltaSeconds;
    let energyDrain = (0.30 * diff) * deltaSeconds;
    if (this.modifiers.inShelter) energyDrain += 0.15; // Active magnetic/air systems in bunker
    this.vitals.energy = Math.min(100, Math.max(0, this.vitals.energy + (energyGen - energyDrain)));

    // 4. Food consumption
    let foodDrain = (0.15 * diff) * deltaSeconds;
    this.vitals.food = Math.max(0, this.vitals.food - foodDrain);

    // 5. Radiation accumulation (RadLab / DONKI telemetry model)
    let currentDoseRate = this.vitals.doseRate;
    if (this.modifiers.radiationEventActive) {
      currentDoseRate += this.modifiers.radiationSpikeRate;
    }
    if (this.modifiers.inShelter) {
      // 95% shielding by Martian/Lunar regolith & water tanks
      currentDoseRate *= 0.05;
    }

    // Accumulate micro-Sieverts (µSv)
    const accumulatedThisTick = (currentDoseRate / 60) * deltaSeconds * 10;
    this.vitals.radiationDose += accumulatedThisTick;

    // 6. Health consequences
    let healthLoss = 0;
    // Low oxygen damages health rapidly
    if (this.vitals.oxygen < 20) {
      healthLoss += (20 - this.vitals.oxygen) * 0.15;
    }
    // Severe dehydration damages health
    if (this.vitals.water < 15) {
      healthLoss += (15 - this.vitals.water) * 0.10;
    }
    // Starvation damages health
    if (this.vitals.food < 10) {
      healthLoss += 0.5;
    }
    // High acute radiation dose damages health
    if (this.vitals.radiationDose > 120) {
      healthLoss += (this.vitals.radiationDose - 120) * 0.05;
    }
    // Total power failure disables climate heating
    if (this.vitals.energy <= 0) {
      healthLoss += 0.8;
    }

    if (healthLoss > 0) {
      this.vitals.health = Math.max(0, this.vitals.health - (healthLoss * deltaSeconds));
      if (this.vitals.health <= 0) {
        this.triggerHealthDepleted();
      } else if (this.vitals.health < 30) {
        this.triggerCriticalWarning('Astronaut Health Low! Take emergency action!');
      }
    } else {
      // Gentle natural recovery if all resources are well supplied
      if (this.vitals.oxygen > 60 && this.vitals.water > 50 && this.vitals.food > 50 && this.vitals.energy > 40) {
        this.vitals.health = Math.min(100, this.vitals.health + 0.15 * deltaSeconds);
      }
    }

    this.updateHUD();
  },

  performSurvivalAction(actionId) {
    let success = false;
    let message = '';

    switch (actionId) {
      case 'emergency-o2':
        if (this.vitals.energy >= 10) {
          this.vitals.energy -= 10;
          this.vitals.oxygen = Math.min(100, this.vitals.oxygen + 30);
          this.modifiers.suitLeak = false;
          message = 'Emergency O₂ Canister Fired! +30% Oxygen';
          success = true;
        } else {
          message = 'Not enough Energy to cycle O₂ reserve!';
        }
        break;

      case 'purify-water':
        if (this.vitals.energy >= 8) {
          this.vitals.energy -= 8;
          this.vitals.water = Math.min(100, this.vitals.water + 25);
          message = 'Closed-Loop Water Distillation Active! +25% Water';
          success = true;
        } else {
          message = 'Not enough Energy to run water distiller!';
        }
        break;

      case 'activate-shelter':
        if (this.vitals.energy >= 15) {
          this.vitals.energy -= 15;
          this.modifiers.inShelter = true;
          message = 'Regolith Radiation Shelter Sealed! 95% Shielding Active';
          success = true;
          // Auto exit shelter after 12 seconds
          setTimeout(() => {
            this.modifiers.inShelter = false;
            this.updateHUD();
          }, 12000);
        } else {
          message = 'Not enough Energy to pressurize radiation airlock!';
        }
        break;

      case 'eat-ration':
        if (this.vitals.food >= 15) {
          this.vitals.food -= 15;
          this.vitals.health = Math.min(100, this.vitals.health + 20);
          this.vitals.energy = Math.min(100, this.vitals.energy + 10);
          message = 'Nutrient Space Meal Consumed! +20% Health';
          success = true;
        } else {
          message = 'Food supplies depleted! Grow fresh crops in greenhouse.';
        }
        break;

      case 'medical-care':
        if (this.vitals.energy >= 12 && this.vitals.water >= 10) {
          this.vitals.energy -= 12;
          this.vitals.water -= 10;
          this.vitals.health = Math.min(100, this.vitals.health + 35);
          message = 'Astronaut First Aid & Saline Infusion! +35% Health';
          success = true;
        } else {
          message = 'Requires 12 Energy & 10 Water for medical bay!';
        }
        break;

      case 'harvest-crop':
        if (this.vitals.water >= 8 && this.vitals.energy >= 8) {
          this.vitals.water -= 8;
          this.vitals.energy -= 8;
          this.vitals.food = Math.min(100, this.vitals.food + 30);
          this.vitals.oxygen = Math.min(100, this.vitals.oxygen + 10);
          message = 'Bio-Dome Salad Harvested! +30 Food & +10% O₂';
          success = true;
        } else {
          message = 'Greenhouse needs water and power to grow crops!';
        }
        break;
    }

    if (success) {
      if (window.AudioManager) window.AudioManager.playChime();
      if (window.RewardsManager) window.RewardsManager.showFloatingNotice(message);
    } else {
      if (window.AudioManager) window.AudioManager.playAlarm?.();
      if (window.RewardsManager) window.RewardsManager.showFloatingNotice(message);
    }

    this.updateHUD();
    return success;
  },

  triggerSolarStormSpike(flareClass = 'X8.7', spikeRate = 18.5) {
    this.modifiers.radiationEventActive = true;
    this.modifiers.radiationSpikeRate = spikeRate;
    if (window.AudioManager) window.AudioManager.playSiren?.();
    if (window.GuideManager) {
      window.GuideManager.speak(`⚠️ NASA DONKI Alert! Solar Flare ${flareClass} detected! Enter the radiation shelter now!`, 'alert');
    }
    this.updateHUD();
  },

  clearSolarStorm() {
    this.modifiers.radiationEventActive = false;
    this.modifiers.radiationSpikeRate = 0;
    this.updateHUD();
  },

  triggerCriticalWarning(msg) {
    if (window.AudioManager) window.AudioManager.playAlarm?.();
    if (this.callbacks.onCriticalAlert) {
      this.callbacks.onCriticalAlert(msg);
    }
  },

  triggerHealthDepleted() {
    this.stopSimulation();
    if (window.AudioManager) window.AudioManager.playFailure?.();
    if (this.callbacks.onHealthDepleted) {
      this.callbacks.onHealthDepleted();
    } else if (window.MissionsManager?.handlePlayerDeath) {
      window.MissionsManager.handlePlayerDeath('Astronaut vitals critical! Health depleted.');
    } else if (window.MissionsManager?.handleMissionFailed) {
      window.MissionsManager.handleMissionFailed('Astronaut vitals critical! Health depleted.');
    }
  },

  triggerOxygenDepleted() {
    this.stopSimulation();
    if (window.AudioManager) window.AudioManager.playFailure?.();
    if (window.MissionsManager?.handlePlayerDeath) {
      window.MissionsManager.handlePlayerDeath('Astronaut oxygen supply depleted! Life support emergency.');
    } else if (window.MissionsManager?.handleMissionFailed) {
      window.MissionsManager.handleMissionFailed('Astronaut oxygen supply depleted! Life support emergency.');
    }
  },

  updateHUD() {
    const elHealth = document.getElementById('hud-vital-health');
    const elO2 = document.getElementById('hud-vital-o2');
    const elWater = document.getElementById('hud-vital-water');
    const elEnergy = document.getElementById('hud-vital-energy');
    const elRadiation = document.getElementById('hud-vital-radiation');
    const elFood = document.getElementById('hud-vital-food');
    const elShelterIndicator = document.getElementById('hud-shelter-indicator');

    const setGauge = (el, val, unit = '%', isGoodHigh = true) => {
      if (!el) return;
      const num = Math.round(val);
      const textSpan = el.querySelector('.vital-val');
      const barFill = el.querySelector('.vital-bar-fill');
      if (textSpan) textSpan.textContent = `${num}${unit}`;
      if (barFill) {
        barFill.style.width = `${Math.min(100, Math.max(0, num))}%`;
        // Color coding
        if (isGoodHigh) {
          if (num > 60) barFill.className = 'vital-bar-fill fill-green';
          else if (num > 25) barFill.className = 'vital-bar-fill fill-yellow';
          else barFill.className = 'vital-bar-fill fill-red pulse-danger';
        } else {
          // Radiation (lower is better)
          if (num < 40) barFill.className = 'vital-bar-fill fill-green';
          else if (num < 100) barFill.className = 'vital-bar-fill fill-yellow';
          else barFill.className = 'vital-bar-fill fill-red pulse-danger';
        }
      }
    };

    setGauge(elHealth, this.vitals.health, '%', true);
    setGauge(elO2, this.vitals.oxygen, '%', true);
    setGauge(elWater, this.vitals.water, '%', true);
    setGauge(elEnergy, this.vitals.energy, '%', true);
    setGauge(elFood, this.vitals.food, 'u', true);

    if (elRadiation) {
      const dose = Math.round(this.vitals.radiationDose);
      const textSpan = elRadiation.querySelector('.vital-val');
      const barFill = elRadiation.querySelector('.vital-bar-fill');
      if (textSpan) textSpan.textContent = `${dose} µSv`;
      if (barFill) {
        const percent = Math.min(100, (dose / 150) * 100);
        barFill.style.width = `${percent}%`;
        if (percent < 30) barFill.className = 'vital-bar-fill fill-green';
        else if (percent < 70) barFill.className = 'vital-bar-fill fill-yellow';
        else barFill.className = 'vital-bar-fill fill-red pulse-danger';
      }
    }

    if (elShelterIndicator) {
      if (this.modifiers.inShelter) {
        elShelterIndicator.classList.remove('hidden');
        elShelterIndicator.textContent = '🛡️ SHELTER ACTIVE (95% SHIELD)';
      } else if (this.modifiers.radiationEventActive) {
        elShelterIndicator.classList.remove('hidden');
        elShelterIndicator.textContent = '⚠️ SOLAR STORM WARNING!';
      } else {
        elShelterIndicator.classList.add('hidden');
      }
    }
  }
};

window.HealthSystem = HealthSystem;

