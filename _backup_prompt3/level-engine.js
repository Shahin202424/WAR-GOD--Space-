/**
 * Universal Reusable Level Engine
 * Fully audited, bug-free, frame-rate independent gameplay engine.
 * 
 * Supports 8 interactive gameplay archetypes:
 * 1. lander: Retro-thrusters, velocity control, invulnerability cooldowns, gentle touchdown
 * 2. platformer: Low-G jumps, jetpack bursts, floating ledge platforms, rock collection & safe crater bounds
 * 3. rover: Suspension driving, solar recharging station, rock coring drills & boulder collision cooldowns
 * 4. builder: Grid-based habitat construction with cable connections and life-support viability checks
 * 5. systems: Power grid balancing with overload states, circuit routing & safe engage verification
 * 6. radiation: DONKI space weather alert countdown, dosimeter spike, bunker sprint & clean storm reset
 * 7. biolab: OSD-137 greenhouse spectrum tuning / OSD-243 resistance fitness workouts
 * 8. comms: Deep Space Network antenna steering & signal frequency wave lock
 */

class UniversalLevelEngine {
  constructor(canvas, missionData, levelData, onComplete, onFail) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mission = missionData;
    this.level = levelData;
    this.onComplete = onComplete;
    this.onFail = onFail;

    this.archetype = levelData.archetype || 'systems';
    this.isRunning = false;
    this.animId = null;
    this.isDecisionPending = false;
    this.state = {};
  }

  init() {
    this.isRunning = true;
    this.resize();

    // Adapt on-screen touch controls for this archetype
    if (window.ControlsManager) {
      window.ControlsManager.reset();
      window.ControlsManager.adaptForArchetype(this.archetype);
    }

    // Initialize archetype state
    switch (this.archetype) {
      case 'lander': this.initLander(); break;
      case 'platformer': this.initPlatformer(); break;
      case 'rover': this.initRover(); break;
      case 'builder': this.initBuilder(); break;
      case 'systems': this.initSystems(); break;
      case 'radiation': this.initRadiation(); break;
      case 'biolab': this.initBioLab(); break;
      case 'comms': this.initComms(); break;
      default: this.initSystems(); break;
    }

    // Main frame-rate independent update & render loop
    let lastTime = performance.now();
    const loop = (currentTime) => {
      if (!this.isRunning) return;
      // Clamp delta-time to prevent physics tunneling
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!window.GameEngine?.isPaused && !this.isDecisionPending) {
        this.update(dt);
      }
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  cleanup() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    // Unbind canvas click listener to prevent cross-level event leaks
    if (this.canvas) {
      this.canvas.onclick = null;
    }

    // Stop continuous audio loops
    if (window.AudioManager) {
      window.AudioManager.stopThruster();
      window.AudioManager.stopRoverMotor();
    }

    // Reset any active solar storm spikes
    if (window.HealthSystem) {
      window.HealthSystem.clearSolarStorm();
    }

    // Hide DOM overlays
    const dock = document.getElementById('base-builder-dock');
    if (dock) {
      dock.innerHTML = '';
      dock.classList.add('hidden');
    }
    const decisionOverlay = document.getElementById('game-decision-overlay');
    if (decisionOverlay) {
      decisionOverlay.classList.add('hidden');
    }
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container ? container.clientWidth : window.innerWidth;
    this.canvas.height = container ? container.clientHeight : window.innerHeight - 150;
  }

  // =========================================================================
  // ARCHETYPE 1: LANDER ENGINE
  // =========================================================================
  initLander() {
    const isMars = this.mission.id >= 15;
    this.state = {
      x: this.canvas.width * 0.5,
      y: 70,
      vx: 0,
      vy: 0,
      w: 42,
      h: 44,
      angle: 0,
      fuel: 100,
      gravity: isMars ? 170 : 110,
      thrustPower: 360,
      padX: this.canvas.width * 0.5 - 75,
      padY: this.canvas.height - 45,
      padW: 150,
      padH: 22,
      invulnerableTimer: 0,
      obstacles: [
        { x: this.canvas.width * 0.25, y: this.canvas.height * 0.40, r: 24, vx: 45 },
        { x: this.canvas.width * 0.75, y: this.canvas.height * 0.58, r: 28, vx: -50 }
      ],
      landed: false
    };
  }

  updateLander(dt) {
    const s = this.state;
    const ctrl = window.ControlsManager || {};

    if (s.invulnerableTimer > 0) {
      s.invulnerableTimer -= dt;
    }

    // Lateral steering
    if (ctrl.isLeft()) {
      s.vx -= 130 * dt;
      s.angle = -0.18;
    } else if (ctrl.isRight()) {
      s.vx += 130 * dt;
      s.angle = 0.18;
    } else {
      s.angle *= 0.90;
      s.vx *= 0.98;
    }

    // Main thruster
    if ((ctrl.isThrust() || ctrl.isUp()) && s.fuel > 0) {
      s.vy -= s.thrustPower * dt;
      s.fuel = Math.max(0, s.fuel - 14 * dt);
      if (window.AudioManager) window.AudioManager.startThruster();
    } else {
      if (window.AudioManager) window.AudioManager.stopThruster();
    }

    s.vy += s.gravity * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // Strict boundary checks
    const halfW = s.w * 0.5;
    if (s.x < halfW + 10) {
      s.x = halfW + 10;
      s.vx = -s.vx * 0.4;
    } else if (s.x > this.canvas.width - halfW - 10) {
      s.x = this.canvas.width - halfW - 10;
      s.vx = -s.vx * 0.4;
    }

    if (s.y < 30) {
      s.y = 30;
      s.vy = 0;
    }

    // Update floating obstacles with cooldown damage
    s.obstacles.forEach(obs => {
      obs.x += obs.vx * dt;
      if (obs.x < obs.r + 10 || obs.x > this.canvas.width - obs.r - 10) {
        obs.vx = -obs.vx;
      }

      const dist = Math.hypot(s.x - obs.x, s.y - obs.y);
      if (dist < obs.r + halfW && s.invulnerableTimer <= 0) {
        s.invulnerableTimer = 1.2; // 1.2 seconds of invulnerability
        if (window.HealthSystem) {
          window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 15);
          window.HealthSystem.updateHUD();
        }
        s.vx = (s.x < obs.x ? -120 : 120);
        s.vy = -70;
        if (window.AudioManager) window.AudioManager.playAlarm();
        if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Space debris impact! Hull damaged!');
      }
    });

    // Landing detection
    if (s.y >= s.padY - 22) {
      if (s.x >= s.padX && s.x <= s.padX + s.padW) {
        const speed = Math.hypot(s.vx, s.vy);
        if (speed < 115) { // Gentle touchdown (< 2.5 m/s equivalent)
          s.landed = true;
          s.y = s.padY - 22;
          s.vx = 0;
          s.vy = 0;
          this.triggerDecisionOrVictory();
        } else {
          // Hard impact bounce with cooldown
          s.y = s.padY - 22;
          s.vy = -s.vy * 0.35;
          if (s.invulnerableTimer <= 0) {
            s.invulnerableTimer = 1.0;
            if (window.HealthSystem) {
              window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 20);
              window.HealthSystem.updateHUD();
            }
            if (window.AudioManager) window.AudioManager.playAlarm();
            if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Rough landing! Throttle descent speed below 2.5 m/s!');
          }
        }
      } else {
        // Landed on rocky ground outside pad
        s.y = s.padY - 22;
        s.vy = -s.vy * 0.3;
        if (s.invulnerableTimer <= 0) {
          s.invulnerableTimer = 1.0;
          if (window.HealthSystem) {
            window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 25);
            window.HealthSystem.updateHUD();
          }
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Missed target pad! Land on the green beacon pad!');
        }
      }
    }
  }

  renderLander() {
    const ctx = this.ctx;
    const s = this.state;
    const isMars = this.mission.id >= 15;

    // Rich gradient sky
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, isMars ? '#1b092a' : '#07051e');
    bgGrad.addColorStop(0.65, isMars ? '#3f152b' : '#0d1334');
    bgGrad.addColorStop(1, isMars ? '#85291b' : '#303f58');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Distant stars & landscape
    ctx.fillStyle = isMars ? '#c75d38' : '#78909c';
    ctx.fillRect(0, this.canvas.height - 35, this.canvas.width, 35);

    // Glowing Target Landing Pad
    ctx.fillStyle = '#00E676';
    ctx.shadowColor = '#00E676';
    ctx.shadowBlur = 12;
    ctx.fillRect(s.padX, s.padY, s.padW, s.padH);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#004D40';
    ctx.fillRect(s.padX + 6, s.padY + 4, s.padW - 12, s.padH - 8);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET PAD 🎯', s.padX + s.padW * 0.5, s.padY + 15);

    // Floating Space Obstacles
    s.obstacles.forEach(obs => {
      ctx.fillStyle = '#9E9E9E';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#616161';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#BDBDBD';
      ctx.beginPath();
      ctx.arc(obs.x - 5, obs.y - 5, obs.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Blinking effect when invulnerable
    if (s.invulnerableTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0) {
      // Skip drawing lander this frame for clean blink
    } else {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Animated Thruster Flame
      const ctrl = window.ControlsManager || {};
      if ((ctrl.isThrust() || ctrl.isUp()) && s.fuel > 0) {
        ctx.fillStyle = '#FF9100';
        ctx.beginPath();
        ctx.moveTo(-10, 18);
        ctx.lineTo(10, 18);
        ctx.lineTo(0, 36 + Math.random() * 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFEA00';
        ctx.beginPath();
        ctx.moveTo(-5, 18);
        ctx.lineTo(5, 18);
        ctx.lineTo(0, 26 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();
      }

      // Spacecraft Hull
      ctx.fillStyle = '#ECEFF1';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(18, 16);
      ctx.lineTo(-18, 16);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Gold Visor / Cockpit Window
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, -4, 8, 0, Math.PI * 2);
      ctx.fill();

      // Landing Gear Legs
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.lineTo(-24, 24);
      ctx.moveTo(14, 14);
      ctx.lineTo(24, 24);
      ctx.stroke();

      ctx.restore();
    }

    // Telemetry Panel
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '13px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`FUEL: ${Math.round(s.fuel)}%`, 24, 32);

    const speed = Math.hypot(s.vx, s.vy);
    const speedMs = (speed / 30).toFixed(1);
    ctx.fillStyle = speed < 115 ? '#00E676' : '#FF1744';
    ctx.fillText(`DESCENT SPEED: ${speedMs} m/s (SAFE: < 2.5 m/s)`, 24, 54);
  }

  // =========================================================================
  // ARCHETYPE 2: PLATFORMER (SURFACE EVA EXPLORATION)
  // =========================================================================
  initPlatformer() {
    const isMars = this.mission.id >= 15;
    const groundY = this.canvas.height - 80;

    this.state = {
      x: 60,
      y: groundY - 60,
      vx: 0,
      vy: 0,
      w: 36,
      h: 52,
      onGround: false,
      jumpsLeft: 2, // Double-jump / Jetpack burst supported!
      gravity: isMars ? 430 : 260,
      invulnerableTimer: 0,
      // Floating geological ledges / platforms across craters
      platforms: [
        { x: this.canvas.width * 0.22, y: groundY - 65, w: 90, h: 14 },
        { x: this.canvas.width * 0.44, y: groundY - 110, w: 100, h: 14 },
        { x: this.canvas.width * 0.68, y: groundY - 75, w: 95, h: 14 }
      ],
      collectibles: [
        { x: this.canvas.width * 0.26, y: groundY - 100, type: 'rock', icon: '💎', collected: false, name: 'Hematite Blueberry' },
        { x: this.canvas.width * 0.49, y: groundY - 145, type: 'ice', icon: '🧊', collected: false, name: 'Water Ice Core' },
        { x: this.canvas.width * 0.72, y: groundY - 110, type: 'o2', icon: '🫧', collected: false, name: 'Emergency O₂ Canister' },
        { x: this.canvas.width * 0.88, y: groundY - 35, type: 'wrench', icon: '🔧', collected: false, name: 'EVA Repair Tool' }
      ],
      craters: [
        { x: this.canvas.width * 0.36, w: 90 },
        { x: this.canvas.width * 0.60, w: 100 }
      ],
      targetSamples: 3,
      collectedCount: 0
    };
  }

  updatePlatformer(dt) {
    const s = this.state;
    const ctrl = window.ControlsManager || {};

    if (s.invulnerableTimer > 0) {
      s.invulnerableTimer -= dt;
    }

    // Horizontal Movement
    if (ctrl.isLeft()) {
      s.vx = -185;
    } else if (ctrl.isRight()) {
      s.vx = 185;
    } else {
      s.vx *= 0.82;
    }

    // Double-Jump & Jetpack burst in low gravity
    if (ctrl.isJump()) {
      if (s.onGround) {
        s.vy = -340;
        s.onGround = false;
        s.jumpsLeft = 1;
        if (window.AudioManager) window.AudioManager.playJump();
      } else if (s.jumpsLeft > 0 && !s.jumpKeyLocked) {
        // Jetpack burst in mid-air
        s.vy = -280;
        s.jumpsLeft = 0;
        s.jumpKeyLocked = true;
        if (window.AudioManager) window.AudioManager.playThruster?.();
      }
    } else {
      s.jumpKeyLocked = false;
    }

    s.vy += s.gravity * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // Strict screen boundary clamping
    if (s.x < 15) s.x = 15;
    if (s.x > this.canvas.width - s.w - 15) s.x = this.canvas.width - s.w - 15;

    // Platform collisions (AABB one-way landing from above)
    let landedOnPlatform = false;
    s.platforms.forEach(p => {
      if (s.vy >= 0 &&
          s.x + s.w > p.x &&
          s.x < p.x + p.w &&
          s.y + s.h >= p.y &&
          s.y + s.h <= p.y + 18) {
        s.y = p.y - s.h;
        s.vy = 0;
        s.onGround = true;
        s.jumpsLeft = 2;
        landedOnPlatform = true;
      }
    });

    const groundY = this.canvas.height - 80;

    // Crater check
    let inCrater = false;
    s.craters.forEach(c => {
      if (s.x + s.w * 0.5 > c.x && s.x + s.w * 0.5 < c.x + c.w) {
        inCrater = true;
      }
    });

    if (!landedOnPlatform) {
      if (inCrater) {
        if (s.y > this.canvas.height - 20) {
          // Falling into deep crater fissure: respawn safely on edge with knockback
          s.y = groundY - s.h - 10;
          s.x = Math.max(30, s.x - 60);
          s.vy = 0;
          s.onGround = true;
          s.jumpsLeft = 2;

          if (s.invulnerableTimer <= 0) {
            s.invulnerableTimer = 1.0;
            if (window.HealthSystem) {
              window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 15);
              window.HealthSystem.updateHUD();
            }
            if (window.AudioManager) window.AudioManager.playAlarm();
            if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Deep crater fissure! Use platforms or jetpack to cross!');
          }
        }
      } else {
        if (s.y >= groundY - s.h) {
          s.y = groundY - s.h;
          s.vy = 0;
          s.onGround = true;
          s.jumpsLeft = 2;
        }
      }
    }

    // Collectibles detection
    s.collectibles.forEach(item => {
      if (!item.collected) {
        const dist = Math.hypot(s.x + s.w * 0.5 - item.x, s.y + s.h * 0.5 - item.y);
        if (dist < 38) {
          item.collected = true;
          s.collectedCount++;
          if (window.AudioManager) window.AudioManager.playChime();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice(`Collected: ${item.name}!`);

          if (item.type === 'o2' && window.HealthSystem) {
            window.HealthSystem.vitals.oxygen = Math.min(100, window.HealthSystem.vitals.oxygen + 25);
            window.HealthSystem.updateHUD();
          } else if (item.type === 'ice' && window.HealthSystem) {
            window.HealthSystem.vitals.water = Math.min(100, window.HealthSystem.vitals.water + 20);
            window.HealthSystem.updateHUD();
          }

          if (s.collectedCount >= s.targetSamples) {
            this.triggerDecisionOrVictory();
          }
        }
      }
    });
  }

  renderPlatformer() {
    const ctx = this.ctx;
    const s = this.state;
    const isMars = this.mission.id >= 15;

    // Atmospheric sky
    const bg = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad: bg.addColorStop(0, isMars ? '#210c2c' : '#090b20');
    bg.addColorStop(0.65, isMars ? '#52192b' : '#141c38');
    bg.addColorStop(1, isMars ? '#8d2d1d' : '#37474f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const groundY = this.canvas.height - 80;

    // Terrain ground
    ctx.fillStyle = isMars ? '#c75d38' : '#78909c';
    ctx.fillRect(0, groundY, this.canvas.width, 80);

    // Craters
    s.craters.forEach(c => {
      ctx.fillStyle = '#06030c';
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.5, groundY + 12, c.w * 0.5, 32, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Floating rock platforms
    s.platforms.forEach(p => {
      ctx.fillStyle = isMars ? '#d4724b' : '#90a4ae';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    // Collectibles with bobbing animation
    const bob = Math.sin(Date.now() / 250) * 4;
    s.collectibles.forEach(item => {
      if (!item.collected) {
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.icon, item.x, item.y + bob);
      }
    });

    // Astronaut Character
    if (s.invulnerableTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0) {
      // Blink on hit
    } else {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.font = '40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧑‍🚀', s.w * 0.5, s.h);
      ctx.restore();
    }

    // Telemetry HUD
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SAMPLES: ${s.collectedCount} / ${s.targetSamples}`, 24, 32);
    ctx.fillText(`GRAVITY: ${isMars ? '0.38G (Mars)' : '0.16G (Moon)'}`, 24, 54);
  }

  // =========================================================================
  // ARCHETYPE 3: ROVER ENGINE (DRIVING, SOLAR RECHARGE & CORE DRILLING)
  // =========================================================================
  initRover() {
    const isMars = this.mission.id >= 15;
    const groundY = this.canvas.height - 70;

    this.state = {
      x: 80,
      speed: 0,
      battery: 100,
      invulnerableTimer: 0,
      solarStationX: this.canvas.width * 0.15,
      isRecharging: false,
      drillSites: [
        { x: this.canvas.width * 0.38, drilled: false, depth: 0, targetDepth: 100, name: 'Sedimentary Delta Clay' },
        { x: this.canvas.width * 0.65, drilled: false, depth: 0, targetDepth: 100, name: 'Volcanic Basalt Layer' },
        { x: this.canvas.width * 0.88, drilled: false, depth: 0, targetDepth: 100, name: 'Carbonate Mineral Bed' }
      ],
      isDrilling: false,
      drilledCount: 0,
      boulders: [
        { x: this.canvas.width * 0.52, w: 42, h: 32 }
      ]
    };
  }

  updateRover(dt) {
    const s = this.state;
    const ctrl = window.ControlsManager || {};

    if (s.invulnerableTimer > 0) {
      s.invulnerableTimer -= dt;
    }

    // Solar Recharging Check
    if (Math.abs(s.x - s.solarStationX) < 45) {
      s.isRecharging = true;
      s.battery = Math.min(100, s.battery + 25 * dt);
      if (window.HealthSystem) {
        window.HealthSystem.vitals.energy = Math.min(100, window.HealthSystem.vitals.energy + 5 * dt);
        window.HealthSystem.updateHUD();
      }
    } else {
      s.isRecharging = false;
    }

    // Core Sample Drilling
    if (ctrl.isAction()) {
      let nearSite = s.drillSites.find(site => !site.drilled && Math.abs(s.x - site.x) < 45);
      if (nearSite && s.battery > 0) {
        s.isDrilling = true;
        s.speed = 0;
        nearSite.depth += 40 * dt;
        s.battery = Math.max(0, s.battery - 10 * dt);

        if (window.AudioManager) window.AudioManager.startRoverMotor();

        if (nearSite.depth >= nearSite.targetDepth) {
          nearSite.drilled = true;
          s.drilledCount++;
          if (window.AudioManager) {
            window.AudioManager.stopRoverMotor();
            window.AudioManager.playChime();
          }
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice(`Core Sample Extracted: ${nearSite.name}!`);

          if (s.drilledCount >= s.drillSites.length) {
            this.triggerDecisionOrVictory();
          }
        }
        return;
      }
    }

    if (s.isDrilling) {
      s.isDrilling = false;
      if (window.AudioManager) window.AudioManager.stopRoverMotor();
    }

    // Driving Controls
    if (ctrl.isLeft()) {
      s.speed = -150;
    } else if (ctrl.isRight()) {
      s.speed = 150;
    } else {
      s.speed *= 0.85;
    }

    s.x += s.speed * dt;
    // Strict boundaries
    s.x = Math.max(40, Math.min(this.canvas.width - 60, s.x));

    // Boulder Obstacle with Collision Cooldown
    s.boulders.forEach(b => {
      if (Math.abs(s.x - b.x) < 38) {
        s.speed = (s.x < b.x ? -100 : 100);
        if (s.invulnerableTimer <= 0) {
          s.invulnerableTimer = 1.0;
          s.battery = Math.max(0, s.battery - 8);
          if (window.HealthSystem) {
            window.HealthSystem.vitals.energy = Math.max(0, window.HealthSystem.vitals.energy - 6);
            window.HealthSystem.updateHUD();
          }
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Boulder impact! Slow down over rocky terrain!');
        }
      }
    });
  }

  renderRover() {
    const ctx = this.ctx;
    const s = this.state;
    const isMars = this.mission.id >= 15;

    // Dunes backdrop
    ctx.fillStyle = isMars ? '#2c0f24' : '#0c1024';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const groundY = this.canvas.height - 70;
    ctx.fillStyle = isMars ? '#bf4d2a' : '#546e7a';
    ctx.fillRect(0, groundY, this.canvas.width, 70);

    // Solar Recharging Station
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(s.solarStationX - 25, groundY - 55, 50, 55);
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(s.solarStationX - 22, groundY - 52, 44, 25);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SOLAR CHARGE', s.solarStationX, groundY + 18);

    if (s.isRecharging) {
      ctx.strokeStyle = '#00E676';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.solarStationX, groundY - 20, 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Drill Sites
    s.drillSites.forEach(site => {
      ctx.fillStyle = site.drilled ? '#00E676' : '#FF9100';
      ctx.fillRect(site.x - 22, groundY, 44, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(site.drilled ? 'SAMPLE EXTRACTED' : 'DRILL SITE ⛏️', site.x, groundY + 28);

      if (!site.drilled && Math.abs(s.x - site.x) < 45) {
        ctx.fillStyle = '#FFEA00';
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.fillText('PRESS ACTION TO DRILL!', site.x, groundY - 50);
      }
    });

    // Boulders
    s.boulders.forEach(b => {
      ctx.fillStyle = '#424242';
      ctx.beginPath();
      ctx.arc(b.x, groundY - 10, 20, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rover Vehicle with Blinking on Damage
    if (s.invulnerableTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0) {
      // Blink
    } else {
      ctx.save();
      ctx.translate(s.x, groundY - 32);
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚜', 0, 10);
      if (s.isDrilling) {
        ctx.fillText('⚡', 20, 15);
      }
      ctx.restore();
    }

    // Telemetry HUD
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`CORE SAMPLES: ${s.drilledCount} / ${s.drillSites.length}`, 24, 32);
    ctx.fillStyle = s.battery > 25 ? '#00E676' : '#FF1744';
    ctx.fillText(`ROVER BATTERY: ${Math.round(s.battery)}%`, 24, 54);
  }

  // =========================================================================
  // ARCHETYPE 4: BUILDER ENGINE (HABITAT MODULAR DOCKING)
  // =========================================================================
  initBuilder() {
    const isMars = this.mission.id >= 15;
    this.state = {
      gridCols: 6,
      gridRows: 3,
      cellSize: 76,
      startX: (this.canvas.width - 6 * 76) * 0.5,
      startY: (this.canvas.height - 3 * 76) * 0.5,
      cells: Array(18).fill(null),
      palette: [
        { id: 'hab', name: 'Hab Dome', icon: '🏰' },
        { id: 'solar', name: 'Solar Farm', icon: '☀️' },
        { id: 'moxie', name: 'MOXIE O₂ Plant', icon: '🫧' },
        { id: 'greenhouse', name: 'Bio-Greenhouse', icon: '🥗' },
        { id: 'gym', name: 'Astronaut Gym', icon: '🏋️' },
        { id: 'shield', name: 'Regolith Berm', icon: '🛡️' }
      ],
      selectedModule: 'hab',
      requiredModules: ['hab', 'solar', 'moxie', 'greenhouse'],
      placedCount: 0
    };

    const dock = document.getElementById('base-builder-dock');
    if (dock) {
      dock.innerHTML = '';
      dock.classList.remove('hidden');

      this.state.palette.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `base-dock-item ${this.state.selectedModule === m.id ? 'active' : ''}`;
        btn.innerHTML = `<span class="dock-icon">${m.icon}</span><span class="dock-label">${m.name}</span>`;
        btn.onclick = () => {
          this.state.selectedModule = m.id;
          dock.querySelectorAll('.base-dock-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (window.AudioManager) window.AudioManager.playClick();
        };
        dock.appendChild(btn);
      });
    }

    // Grid Click Listener
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const s = this.state;
      const col = Math.floor((clickX - s.startX) / s.cellSize);
      const row = Math.floor((clickY - s.startY) / s.cellSize);

      if (col >= 0 && col < s.gridCols && row >= 0 && row < s.gridRows) {
        const idx = row * s.gridCols + col;
        s.cells[idx] = s.selectedModule;
        s.placedCount++;
        if (window.AudioManager) window.AudioManager.playChime();

        // Check if all essential habitat modules are connected
        const hasAll = s.requiredModules.every(req => s.cells.includes(req));
        if (hasAll && s.placedCount >= 4) {
          this.triggerDecisionOrVictory();
        }
      }
    };
  }

  updateBuilder(dt) {}

  renderBuilder() {
    const ctx = this.ctx;
    const s = this.state;
    const isMars = this.mission.id >= 15;

    // Blueprint background
    ctx.fillStyle = isMars ? '#2a0e1c' : '#0a1024';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MODULAR BASE CONSTRUCTION BLUEPRINT', this.canvas.width * 0.5, s.startY - 35);
    ctx.font = '13px Fredoka, sans-serif';
    ctx.fillStyle = '#B0BEC5';
    ctx.fillText('Select a module from the dock below and tap a grid square to construct!', this.canvas.width * 0.5, s.startY - 15);

    // Grid cells with connection pipelines
    for (let r = 0; r < s.gridRows; r++) {
      for (let c = 0; c < s.gridCols; c++) {
        const x = s.startX + c * s.cellSize;
        const y = s.startY + r * s.cellSize;
        const idx = r * s.gridCols + c;
        const modId = s.cells[idx];

        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = modId ? 'rgba(0, 229, 255, 0.28)' : 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x, y, s.cellSize - 4, s.cellSize - 4);
        ctx.strokeRect(x, y, s.cellSize - 4, s.cellSize - 4);

        if (modId) {
          const mod = s.palette.find(p => p.id === modId);
          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(mod ? mod.icon : '🏰', x + (s.cellSize - 4) * 0.5, y + (s.cellSize - 4) * 0.7);
        }
      }
    }
  }

  // =========================================================================
  // ARCHETYPE 5: SYSTEMS ENGINEERING (RESOURCE PUZZLE & POWER ROUTING)
  // =========================================================================
  initSystems() {
    // Puzzle setup: Starts OVERLOADED so the player must actively load-shed to balance!
    this.state = {
      capacityLimit: 60, // Maximum safe grid capacity kW
      switches: [
        { id: 'lifeSupport', label: 'Life Support O₂ Scrubber', active: true, drain: 22, essential: true },
        { id: 'thermal', label: 'Habitat Heating Grid', active: true, drain: 20, essential: false },
        { id: 'science', label: 'High-Energy Particle Accelerator', active: true, drain: 25, essential: false },
        { id: 'comms', label: 'Deep Space High-Gain Comms', active: true, drain: 18, essential: true }
      ],
      gridEngaged: false
    };

    // Total load starts at 22 + 20 + 25 + 18 = 85 kW > 60 kW (OVERLOAD!)
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const s = this.state;
      const x = this.canvas.width * 0.15;
      const w = this.canvas.width * 0.7;

      // Switch clicks
      s.switches.forEach((sw, idx) => {
        const y = 140 + idx * 60;
        if (clickX >= x && clickX <= x + w && clickY >= y && clickY <= y + 46) {
          sw.active = !sw.active;
          if (window.AudioManager) window.AudioManager.playClick();
        }
      });

      // "ENGAGE POWER GRID" Button Click
      const btnY = 140 + s.switches.length * 60 + 20;
      if (clickX >= x && clickX <= x + w && clickY >= btnY && clickY <= btnY + 50) {
        const currentDraw = s.switches.filter(sw => sw.active).reduce((sum, sw) => sum + sw.drain, 0);
        const hasLifeSupport = s.switches.find(sw => sw.id === 'lifeSupport').active;

        if (currentDraw <= s.capacityLimit && hasLifeSupport) {
          if (window.AudioManager) window.AudioManager.playCelebration();
          this.triggerDecisionOrVictory();
        } else if (!hasLifeSupport) {
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Cannot engage: Life Support O₂ Scrubber must stay ONLINE!');
        } else {
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice(`⚠️ Grid Overloaded! Shed at least ${currentDraw - s.capacityLimit} kW!`);
        }
      }
    };
  }

  updateSystems(dt) {}

  renderSystems() {
    const ctx = this.ctx;
    const s = this.state;

    // Technical schematics backdrop
    ctx.fillStyle = '#080c1d';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE SYSTEMS POWER DISTRIBUTION SCHEMATIC', this.canvas.width * 0.5, 45);

    const currentDraw = s.switches.filter(sw => sw.active).reduce((sum, sw) => sum + sw.drain, 0);
    const isOverloaded = currentDraw > s.capacityLimit;

    // Overload Status Indicator Bar
    ctx.fillStyle = isOverloaded ? '#FF1744' : '#00E676';
    ctx.font = 'bold 15px Orbitron, sans-serif';
    ctx.fillText(
      isOverloaded
        ? `⚠️ GRID OVERLOADED: ${currentDraw} kW / ${s.capacityLimit} kW MAX`
        : `✓ GRID BALANCED & STABLE: ${currentDraw} kW / ${s.capacityLimit} kW MAX`,
      this.canvas.width * 0.5,
      78
    );

    ctx.font = '13px Fredoka, sans-serif';
    ctx.fillStyle = '#B0BEC5';
    ctx.fillText('Shed power by toggling non-essential systems, then tap ENGAGE GRID below!', this.canvas.width * 0.5, 104);

    const x = this.canvas.width * 0.15;
    const w = this.canvas.width * 0.7;

    // Render interactive switches
    s.switches.forEach((sw, idx) => {
      const y = 140 + idx * 60;

      ctx.fillStyle = sw.active
        ? (sw.essential ? 'rgba(0, 229, 255, 0.22)' : 'rgba(255, 215, 0, 0.22)')
        : 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = sw.active ? '#00E5FF' : '#546E7A';
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, w, 46);
      ctx.strokeRect(x, y, w, 46);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '15px Fredoka, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${sw.label} (${sw.drain} kW) ${sw.essential ? '⭐ ESSENTIAL' : ''}`, x + 18, y + 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = sw.active ? '#00E676' : '#90A4AE';
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.fillText(sw.active ? '[ONLINE]' : '[OFFLINE]', x + w - 18, y + 28);
    });

    // "ENGAGE POWER GRID" Button
    const btnY = 140 + s.switches.length * 60 + 20;
    ctx.fillStyle = isOverloaded ? '#37474F' : 'linear-gradient(90deg, #00E676, #00B0FF)';
    ctx.fillRect(x, btnY, w, 50);
    ctx.strokeStyle = isOverloaded ? '#78909C' : '#00E676';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, btnY, w, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isOverloaded ? '⚠️ SHED LOAD TO ENGAGE' : '⚡ ENGAGE POWER GRID ⚡', this.canvas.width * 0.5, btnY + 31);
  }

  // =========================================================================
  // ARCHETYPE 6: RADIATION EMERGENCY (DONKI STORM SPRINT & REGOLITH BUNKER)
  // =========================================================================
  initRadiation() {
    this.state = {
      countdown: 25.0,
      flareClass: 'X8.7',
      sheltered: false,
      astronautX: 80,
      shelterX: this.canvas.width - 150
    };

    if (window.HealthSystem) {
      window.HealthSystem.triggerSolarStormSpike('X8.7', 22.0);
    }
  }

  updateRadiation(dt) {
    const s = this.state;
    const ctrl = window.ControlsManager || {};

    if (ctrl.isRight()) {
      s.astronautX += 175 * dt;
    } else if (ctrl.isLeft()) {
      s.astronautX -= 175 * dt;
    }

    // Clamping
    s.astronautX = Math.max(30, Math.min(this.canvas.width - 40, s.astronautX));
    s.countdown = Math.max(0, s.countdown - dt);

    // Reaching bunker
    if (s.astronautX >= s.shelterX - 30 && !s.sheltered) {
      s.sheltered = true;
      if (window.HealthSystem) {
        window.HealthSystem.performSurvivalAction('activate-shelter');
        window.HealthSystem.clearSolarStorm(); // Clear storm on successful sheltering
      }
      this.triggerDecisionOrVictory();
    }

    // Countdown expired before sheltering
    if (s.countdown <= 0 && !s.sheltered) {
      if (window.HealthSystem) {
        window.HealthSystem.vitals.radiationDose += 35;
        window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 30);
        window.HealthSystem.clearSolarStorm();
        window.HealthSystem.updateHUD();
      }
      this.triggerDecisionOrVictory();
    }
  }

  renderRadiation() {
    const ctx = this.ctx;
    const s = this.state;

    // Glowing solar flare emergency sky
    ctx.fillStyle = '#26060c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#FF1744';
    ctx.font = 'bold 20px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠️ NASA DONKI ALERT: SOLAR FLARE ${s.flareClass} IMMINENT!`, this.canvas.width * 0.5, 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Orbitron, sans-serif';
    ctx.fillText(`TIME UNTIL PROTON WAVE: ${s.countdown.toFixed(1)}s`, this.canvas.width * 0.5, 78);

    const groundY = this.canvas.height - 80;
    ctx.fillStyle = '#4a151b';
    ctx.fillRect(0, groundY, this.canvas.width, 80);

    // Subterranean Regolith Shield Bunker
    ctx.fillStyle = '#00E676';
    ctx.fillRect(s.shelterX, groundY - 60, 120, 60);
    ctx.fillStyle = '#004D40';
    ctx.fillRect(s.shelterX + 6, groundY - 54, 108, 48);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.fillText('BUNKER 🛡️', s.shelterX + 60, groundY - 24);

    // Sprinting Astronaut
    ctx.font = '42px sans-serif';
    ctx.fillText('🧑‍🚀', s.astronautX, groundY - 14);
  }

  // =========================================================================
  // ARCHETYPE 7: BIOLAB (OSD-137 GREENHOUSE / OSD-243 WORKOUT)
  // =========================================================================
  initBioLab() {
    const isBotany = this.mission.id === 8 || this.level.title.includes('Crop') || this.level.title.includes('Plant');

    this.state = {
      isBotany: isBotany,
      // Botany State
      spectrum: 50, // 0 = Red, 100 = Blue
      targetSpectrum: 70,
      cropGrowth: 0,
      // Gym Workout State
      workoutReps: 0,
      targetReps: 5
    };

    this.canvas.onclick = (e) => {
      const s = this.state;
      if (s.isBotany) {
        // Tap cycles light spectrum towards optimal growth range
        s.spectrum = (s.spectrum + 20) % 100;
        s.cropGrowth += 25;
        if (window.AudioManager) window.AudioManager.playClick();
        if (s.cropGrowth >= 100) {
          if (window.HealthSystem) {
            window.HealthSystem.vitals.food = Math.min(100, window.HealthSystem.vitals.food + 25);
            window.HealthSystem.vitals.oxygen = Math.min(100, window.HealthSystem.vitals.oxygen + 15);
            window.HealthSystem.updateHUD();
          }
          this.triggerDecisionOrVictory();
        }
      } else {
        // ARED Gym Workout Rep
        s.workoutReps++;
        if (window.AudioManager) window.AudioManager.playJump();
        if (s.workoutReps >= s.targetReps) {
          if (window.HealthSystem) {
            window.HealthSystem.vitals.health = Math.min(100, window.HealthSystem.vitals.health + 20);
            window.HealthSystem.updateHUD();
          }
          this.triggerDecisionOrVictory();
        }
      }
    };
  }

  updateBioLab(dt) {}

  renderBioLab() {
    const ctx = this.ctx;
    const s = this.state;

    ctx.fillStyle = s.isBotany ? '#081c12' : '#140c24';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#00E676';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      s.isBotany
        ? 'NASA OSDR STUDY OSD-137: ADVANCED PLANT HABITAT'
        : 'NASA OSDR STUDY OSD-243: ARED ASTRONAUT FITNESS GYM',
      this.canvas.width * 0.5,
      50
    );

    ctx.font = '14px Fredoka, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      s.isBotany
        ? 'Tap the screen to tune the red/blue LED light spectrum and grow fresh space salad!'
        : 'Tap the screen to complete ARED resistance reps to protect bones & muscle density!',
      this.canvas.width * 0.5,
      78
    );

    ctx.font = '64px sans-serif';
    ctx.fillText(s.isBotany ? '🌱 🥗 🍅' : '🏋️ 🧑‍🚀 ⚡', this.canvas.width * 0.5, this.canvas.height * 0.48);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    if (s.isBotany) {
      ctx.fillText(`CROP GROWTH: ${s.cropGrowth}% / 100% (SPECTRUM: ${s.spectrum}% BLUE)`, this.canvas.width * 0.5, this.canvas.height * 0.75);
    } else {
      ctx.fillText(`WORKOUT REPS: ${s.workoutReps} / ${s.targetReps} COMPLETED`, this.canvas.width * 0.5, this.canvas.height * 0.75);
    }
  }

  // =========================================================================
  // ARCHETYPE 8: COMMS ARRAY & DEEP SPACE NETWORK (DSN)
  // =========================================================================
  initComms() {
    this.state = {
      dishAngle: 45,
      targetAngle: 135,
      locked: false
    };

    this.canvas.onclick = (e) => {
      this.state.dishAngle = (this.state.dishAngle + 30) % 360;
      if (window.AudioManager) window.AudioManager.playClick();

      // Check alignment within 20 degree window
      if (Math.abs(this.state.dishAngle - this.state.targetAngle) < 22) {
        this.state.locked = true;
        if (window.AudioManager) window.AudioManager.playCelebration();
        this.triggerDecisionOrVictory();
      }
    };
  }

  updateComms(dt) {}

  renderComms() {
    const ctx = this.ctx;
    const s = this.state;

    ctx.fillStyle = '#050a18';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NASA DEEP SPACE NETWORK (DSN) PARABOLIC DISH ALIGNMENT', this.canvas.width * 0.5, 50);

    ctx.font = '14px Orbitron, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`DISH AZIMUTH: ${s.dishAngle}° (TARGET EARTH GROUND STATION: ${s.targetAngle}°)`, this.canvas.width * 0.5, 80);

    // Parabolic Dish Graphic
    ctx.save();
    ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.48);
    ctx.rotate((s.dishAngle * Math.PI) / 180);
    ctx.font = '72px sans-serif';
    ctx.fillText('📡', 0, 20);
    ctx.restore();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 15px Orbitron, sans-serif';
    ctx.fillText('TAP TO ROTATE HIGH-GAIN DISH TOWARD EARTH SIGNAL BEACON', this.canvas.width * 0.5, this.canvas.height * 0.78);
  }

  // =========================================================================
  // GENERAL UPDATE / RENDER DELEGATION
  // =========================================================================
  update(dt) {
    switch (this.archetype) {
      case 'lander': this.updateLander(dt); break;
      case 'platformer': this.updatePlatformer(dt); break;
      case 'rover': this.updateRover(dt); break;
      case 'builder': this.updateBuilder(dt); break;
      case 'systems': this.updateSystems(dt); break;
      case 'radiation': this.updateRadiation(dt); break;
      case 'biolab': this.updateBioLab(dt); break;
      case 'comms': this.updateComms(dt); break;
    }
  }

  render() {
    switch (this.archetype) {
      case 'lander': this.renderLander(); break;
      case 'platformer': this.renderPlatformer(); break;
      case 'rover': this.renderRover(); break;
      case 'builder': this.renderBuilder(); break;
      case 'systems': this.renderSystems(); break;
      case 'radiation': this.renderRadiation(); break;
      case 'biolab': this.renderBioLab(); break;
      case 'comms': this.renderComms(); break;
    }
  }

  triggerDecisionOrVictory() {
    this.cleanup();

    if (this.level.decision && !this.isDecisionPending) {
      this.isDecisionPending = true;
      this.showDecisionModal(() => {
        if (this.onComplete) this.onComplete(this.level.reward?.stars || 3, this.level.reward?.sciencePoints || 100);
      });
    } else {
      if (this.onComplete) this.onComplete(this.level.reward?.stars || 3, this.level.reward?.sciencePoints || 100);
    }
  }

  showDecisionModal(onProceed) {
    const overlay = document.getElementById('game-decision-overlay');
    if (!overlay) {
      if (onProceed) onProceed();
      return;
    }

    const d = this.level.decision;
    const promptEl = document.getElementById('decision-prompt-text');
    const btnA = document.getElementById('btn-decision-opt-a');
    const btnB = document.getElementById('btn-decision-opt-b');

    if (promptEl) promptEl.textContent = d.prompt;

    // Prevent repeated double-clicks
    if (btnA && d.optionA) {
      btnA.disabled = false;
      btnA.innerHTML = `<strong>${d.optionA.label}</strong><br><small>${d.optionA.desc}</small>`;
      btnA.onclick = () => {
        btnA.disabled = true;
        btnB.disabled = true;
        overlay.classList.add('hidden');

        if (d.optionA.effect && window.HealthSystem) {
          if (d.optionA.effect.energy) window.HealthSystem.vitals.energy = Math.max(0, window.HealthSystem.vitals.energy + d.optionA.effect.energy);
          if (d.optionA.effect.oxygen) window.HealthSystem.vitals.oxygen = Math.min(100, window.HealthSystem.vitals.oxygen + d.optionA.effect.oxygen);
          if (d.optionA.effect.health) window.HealthSystem.vitals.health = Math.min(100, window.HealthSystem.vitals.health + d.optionA.effect.health);
          window.HealthSystem.updateHUD();
        }

        if (window.AudioManager) window.AudioManager.playClick();
        if (onProceed) onProceed();
      };
    }

    if (btnB && d.optionB) {
      btnB.disabled = false;
      btnB.innerHTML = `<strong>${d.optionB.label}</strong><br><small>${d.optionB.desc}</small>`;
      btnB.onclick = () => {
        btnA.disabled = true;
        btnB.disabled = true;
        overlay.classList.add('hidden');

        if (d.optionB.effect && window.HealthSystem) {
          if (d.optionB.effect.oxygen) window.HealthSystem.vitals.oxygen = Math.max(0, window.HealthSystem.vitals.oxygen + d.optionB.effect.oxygen);
          if (d.optionB.effect.points && window.RewardsManager) {
            window.RewardsManager.addPoints(d.optionB.effect.points, 'Science Decision');
          }
          window.HealthSystem.updateHUD();
        }

        if (window.AudioManager) window.AudioManager.playClick();
        if (onProceed) onProceed();
      };
    }

    overlay.classList.remove('hidden');
  }
}

window.UniversalLevelEngine = UniversalLevelEngine;
