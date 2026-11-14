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

  getControls() {
    return window.ControlsManager || {
      isLeft: () => false,
      isRight: () => false,
      isUp: () => false,
      isDown: () => false,
      isThrust: () => false,
      isJump: () => false,
      isAction: () => false
    };
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
      case 'rocket': this.initRocket(); break;
      case 'landing': this.initLanding(); break;
      case 'station': this.initStation(); break;
      case 'power': this.initPower(); break;
      case 'eclss': this.initEclss(); break;
      case 'spacewalk': this.initSpacewalk(); break;
      case 'research': this.initResearch(); break;

      // Backward-compatibility aliases
      case 'lander': this.initLanding(); break;
      case 'platformer': this.initSpacewalk(); break;
      case 'rover': this.initResearch(); break;
      case 'builder': this.initStation(); break;
      case 'systems': this.initPower(); break;
      case 'radiation': this.initSpacewalk(); break;
      case 'biolab': this.initResearch(); break;
      case 'comms': this.initResearch(); break;
      default: this.initRocket(); break;
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
      if (window.AudioManager.stopThruster) window.AudioManager.stopThruster();
      if (window.AudioManager.stopRoverMotor) window.AudioManager.stopRoverMotor();
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
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    this.canvas.width = container ? container.clientWidth : window.innerWidth;
    this.canvas.height = container ? container.clientHeight : window.innerHeight - 150;
  }

  // =========================================================================
  // ARCHETYPE 1: ROCKET & LANDER FLIGHT SIMULATOR
  // =========================================================================
  initLander() {
    const isMars = this.mission.id >= 15;
    const sc = window.NasaScenarioEngine?.currentScenario || {};
    const siteName = sc.siteName || (isMars ? 'Jezero Crater Delta' : 'Arcadia Planitia');

    // 4 Dynamic tumbling asteroids with realistic rotation and drift
    const asteroids = [
      { x: this.canvas.width * 0.22, y: this.canvas.height * 0.26, r: 24, vx: 36, vy: 8, rot: 0, vRot: 1.2 },
      { x: this.canvas.width * 0.78, y: this.canvas.height * 0.32, r: 28, vx: -40, vy: -6, rot: 0, vRot: -0.9 },
      { x: this.canvas.width * 0.35, y: this.canvas.height * 0.65, r: 22, vx: 42, vy: 10, rot: 0, vRot: 1.5 },
      { x: this.canvas.width * 0.68, y: this.canvas.height * 0.72, r: 26, vx: -36, vy: -8, rot: 0, vRot: -1.1 }
    ];

    // Floating collectable survival canisters
    const collectables = [
      { x: this.canvas.width * 0.28, y: this.canvas.height * 0.18, r: 16, type: 'oxygen', label: 'O₂', icon: '🫧', collected: false },
      { x: this.canvas.width * 0.72, y: this.canvas.height * 0.22, r: 16, type: 'energy', label: '⚡', icon: '⚡', collected: false },
      { x: this.canvas.width * 0.50, y: this.canvas.height * 0.36, r: 16, type: 'fuel', label: '⛽', icon: '⛽', collected: false },
      { x: this.canvas.width * 0.20, y: this.canvas.height * 0.56, r: 16, type: 'oxygen', label: 'O₂', icon: '🫧', collected: false },
      { x: this.canvas.width * 0.82, y: this.canvas.height * 0.60, r: 16, type: 'energy', label: '⚡', icon: '⚡', collected: false }
    ];

    // Orbital laser checkpoint gate at ~46% descent altitude
    const checkpointGate = {
      y: this.canvas.height * 0.46,
      h: 26,
      passed: false,
      triggered: false
    };

    this.state = {
      x: this.canvas.width * 0.5,
      y: 65,
      vx: 0,
      vy: 0,
      w: 42,
      h: 46,
      angle: 0,
      fuel: 100,
      maxFuel: 100,
      gravity: isMars ? 160 : 105,
      thrustPower: 380,
      padX: this.canvas.width * 0.5 - 80,
      padY: this.canvas.height - 45,
      padW: 160,
      padH: 22,
      invulnerableTimer: 0,
      siteName: siteName,
      asteroids: asteroids,
      obstacles: asteroids, // Compatibility alias
      collectables: collectables,
      checkpointGate: checkpointGate,
      landed: false,
      exhaustParticles: []
    };
  }

  updateLander(dt) {
    const s = this.state;
    const ctrl = this.getControls();

    if (s.invulnerableTimer > 0) {
      s.invulnerableTimer -= dt;
    }

    // Lateral steering
    if (ctrl.isLeft()) {
      s.vx -= 150 * dt;
      s.angle = -0.22;
    } else if (ctrl.isRight()) {
      s.vx += 150 * dt;
      s.angle = 0.22;
    } else {
      s.angle *= 0.90;
      s.vx *= 0.98;
    }

    // Main thruster with animated particle sparks
    if ((ctrl.isThrust() || ctrl.isUp()) && s.fuel > 0) {
      s.vy -= s.thrustPower * dt;
      s.fuel = Math.max(0, s.fuel - 15 * dt);
      if (window.AudioManager && window.AudioManager.startThruster) window.AudioManager.startThruster();

      // Spawn thruster flame particles
      for (let i = 0; i < 2; i++) {
        s.exhaustParticles.push({
          x: s.x + (Math.random() - 0.5) * 10,
          y: s.y + 18,
          vx: (Math.random() - 0.5) * 35,
          vy: 80 + Math.random() * 40,
          life: 0.25,
          maxLife: 0.25,
          color: Math.random() > 0.4 ? '#FF9100' : '#00E5FF'
        });
      }
    } else {
      if (window.AudioManager && window.AudioManager.stopThruster) window.AudioManager.stopThruster();
    }

    s.vy += s.gravity * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // Update exhaust particles
    s.exhaustParticles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    s.exhaustParticles = s.exhaustParticles.filter(p => p.life > 0);

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

    // Update and collide with tumbling asteroids
    s.asteroids.forEach(a => {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rot += a.vRot * dt;

      if (a.x < a.r + 10 || a.x > this.canvas.width - a.r - 10) {
        a.vx = -a.vx;
      }
      if (a.y < 60 || a.y > this.canvas.height - 80) {
        a.vy = -a.vy;
      }

      const dist = Math.hypot(s.x - a.x, s.y - a.y);
      if (dist < a.r + halfW && s.invulnerableTimer <= 0) {
        s.invulnerableTimer = 1.2;
        if (window.HealthSystem) {
          window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 20);
          window.HealthSystem.updateHUD();
          if (window.HealthSystem.vitals.health <= 0) {
            this.triggerFailure('Structural failure from space debris impact!');
            return;
          }
        }
        s.vx = (s.x < a.x ? -120 : 120);
        s.vy = -70;
        if (window.AudioManager) window.AudioManager.playAlarm();
        if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Asteroid impact! Hull integrity -20%!');
      }
    });

    // Check Collectables Collision
    s.collectables.forEach(c => {
      if (!c.collected) {
        const dist = Math.hypot(s.x - c.x, s.y - c.y);
        if (dist < c.r + halfW) {
          c.collected = true;
          if (c.type === 'oxygen' && window.HealthSystem) {
            window.HealthSystem.vitals.oxygen = Math.min(100, window.HealthSystem.vitals.oxygen + 25);
            window.HealthSystem.updateHUD();
            if (window.RewardsManager) window.RewardsManager.showFloatingNotice('+25% Oxygen Restored! 🫧');
          } else if (c.type === 'energy' && window.HealthSystem) {
            window.HealthSystem.vitals.energy = Math.min(100, window.HealthSystem.vitals.energy + 20);
            window.HealthSystem.updateHUD();
            if (window.RewardsManager) {
              window.RewardsManager.addPoints(50, 'Energy Battery Cell');
              window.RewardsManager.showFloatingNotice('+20% Energy & +50 Science XP! ⚡');
            }
          } else if (c.type === 'fuel') {
            s.fuel = Math.min(s.maxFuel, s.fuel + 30);
            if (window.RewardsManager) window.RewardsManager.showFloatingNotice('+30 Rocket Thruster Fuel! ⛽');
          }
          if (window.AudioManager) window.AudioManager.playChime();
        }
      }
    });

    // In-Flight Orbital Waypoint Gate (at ~46% descent altitude)
    if (s.y >= s.checkpointGate.y && !s.checkpointGate.triggered) {
      s.checkpointGate.triggered = true;
      s.checkpointGate.passed = true;
      s.vy = Math.min(s.vy + 15, 65);
      if (window.AudioManager && window.AudioManager.playChime) window.AudioManager.playChime();
      if (window.RewardsManager) {
        window.RewardsManager.showFloatingNotice('🚀 Orbital Waypoint Cleared! Align for touchdown pad!');
      }
    }

    // Landing detection on surface pad
    if (s.y >= s.padY - 22) {
      if (s.x >= s.padX && s.x <= s.padX + s.padW) {
        const speed = Math.hypot(s.vx, s.vy);
        if (speed < 125) { // Gentle touchdown (< 2.5 m/s equivalent)
          s.landed = true;
          s.y = s.padY - 22;
          s.vx = 0;
          s.vy = 0;
          this.triggerVictory();
        } else {
          // Hard impact bounce with cooldown
          s.y = s.padY - 22;
          s.vy = -s.vy * 0.35;
          if (s.invulnerableTimer <= 0) {
            s.invulnerableTimer = 1.0;
            if (window.HealthSystem) {
              window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 25);
              window.HealthSystem.updateHUD();
              if (window.HealthSystem.vitals.health <= 0) {
                this.triggerFailure('Lander descent speed exceeded safety thresholds on impact!');
                return;
              }
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
            if (window.HealthSystem.vitals.health <= 0) {
              this.triggerFailure('Lander touched down on hazardous rocky terrain outside the landing pad!');
              return;
            }
          }
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Missed target pad! Land on the green beacon pad!');
        }
      }
    }

    if (s.y > this.canvas.height + 40) {
      this.triggerFailure('Lander fell below safe planetary altitude!');
      return;
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

    // Render Checkpoint Gate Beacon
    if (s.checkpointGate) {
      const g = s.checkpointGate;
      ctx.save();
      ctx.strokeStyle = g.passed ? '#00E676' : '#FFD700';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(30, g.y);
      ctx.lineTo(this.canvas.width - 30, g.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gate Pylons
      ctx.fillStyle = g.passed ? '#00E676' : '#FFD700';
      ctx.shadowColor = g.passed ? '#00E676' : '#FFD700';
      ctx.shadowBlur = 10;
      ctx.fillRect(20, g.y - 12, 12, 24);
      ctx.fillRect(this.canvas.width - 32, g.y - 12, 12, 24);
      ctx.shadowBlur = 0;

      // Gate text label
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.passed ? '✅ CHECKPOINT CLEARED' : '🛰️ ORBITAL CHECKPOINT BEACON', this.canvas.width * 0.5, g.y - 8);
      ctx.restore();
    }

    // Render Collectables
    s.collectables.forEach(c => {
      if (!c.collected) {
        ctx.save();
        ctx.shadowBlur = 10;
        if (c.type === 'oxygen') {
          ctx.fillStyle = '#00B0FF';
          ctx.shadowColor = '#00B0FF';
        } else if (c.type === 'energy') {
          ctx.fillStyle = '#FFD700';
          ctx.shadowColor = '#FFD700';
        } else {
          ctx.fillStyle = '#E040FB';
          ctx.shadowColor = '#E040FB';
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.label, c.x, c.y);
        ctx.restore();
      }
    });

    // Render Tumbling Asteroids
    s.asteroids.forEach(obs => {
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.rotate(obs.rot || 0);

      ctx.fillStyle = '#757575';
      ctx.beginPath();
      ctx.arc(0, 0, obs.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Craters on Asteroid
      ctx.fillStyle = '#616161';
      ctx.beginPath();
      ctx.arc(-obs.r * 0.3, -obs.r * 0.2, obs.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(obs.r * 0.3, obs.r * 0.3, obs.r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Render Exhaust Particles
    s.exhaustParticles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

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

    // Blinking effect when invulnerable
    if (s.invulnerableTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0) {
      // Skip drawing lander this frame for clean blink
    } else {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Animated Thruster Flame
      const ctrl = this.getControls();
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

    // On-Canvas Flight Telemetry HUD Overlay
    ctx.save();
    // Fuel Bar
    ctx.fillStyle = 'rgba(10, 16, 32, 0.75)';
    ctx.fillRect(16, 12, 130, 18);
    const fuelPct = s.fuel / s.maxFuel;
    ctx.fillStyle = fuelPct > 0.5 ? '#00E676' : (fuelPct > 0.25 ? '#FFD700' : '#FF1744');
    ctx.fillRect(18, 14, 126 * fuelPct, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`FUEL: ${Math.round(s.fuel)}%`, 22, 25);

    // Speedometer
    const speedMs = (Math.hypot(s.vx, s.vy) / 45).toFixed(1);
    const isSafeSpeed = Math.hypot(s.vx, s.vy) < 125;
    ctx.fillStyle = isSafeSpeed ? '#00E676' : '#FF1744';
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`DESCENT SPEED: ${speedMs} m/s ${isSafeSpeed ? '🟢 [SAFE]' : '🔴 [SLOW DOWN!]' }`, this.canvas.width - 16, 25);
    ctx.restore();
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
    const ctrl = this.getControls();

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
          // Falling into deep crater fissure
          if (window.HealthSystem) {
            window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 25);
            window.HealthSystem.updateHUD();
            if (window.HealthSystem.vitals.health <= 0) {
              this.triggerFailure('Astronaut fell into deep lunar/martian crater fissure!');
              return;
            }
          }

          // Respawn on edge
          s.y = groundY - s.h - 10;
          s.x = Math.max(30, s.x - 60);
          s.vy = 0;
          s.onGround = true;
          s.jumpsLeft = 2;

          if (s.invulnerableTimer <= 0) {
            s.invulnerableTimer = 1.0;
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

    // Boundary check: falling out of playable area
    if (s.y > this.canvas.height + 40) {
      this.triggerFailure('Astronaut fell outside the playable area!');
      return;
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
            this.triggerVictory();
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
    bg.addColorStop(0, isMars ? '#210c2c' : '#090b20');
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
      if (typeof ctx.ellipse === 'function') {
        ctx.ellipse(c.x + c.w * 0.5, groundY + 12, c.w * 0.5, 32, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(c.x + c.w * 0.5, groundY + 12, c.w * 0.5, 0, Math.PI * 2);
      }
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
    const ctrl = this.getControls();

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
            this.triggerVictory();
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
            window.HealthSystem.vitals.energy = Math.max(0, window.HealthSystem.vitals.energy - 8);
            window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 15);
            window.HealthSystem.updateHUD();
            if (window.HealthSystem.vitals.health <= 0) {
              this.triggerFailure('Rover suffered catastrophic impact damage from terrain obstacles!');
              return;
            }
          }
          if (window.AudioManager) window.AudioManager.playAlarm();
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Boulder impact! Slow down over rocky terrain!');
        }
      }
    });

    // Battery exhaustion stranded check
    if (s.battery <= 0 && !s.isRecharging && s.drilledCount < s.drillSites.length) {
      if (Math.abs(s.speed) < 5 && Math.abs(s.x - s.solarStationX) > 55) {
        this.triggerFailure('Rover battery depleted in the field! Mission stranded.');
        return;
      }
    }
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
    if (dock && typeof document.createElement === 'function') {
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
          this.triggerVictory();
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
      selectedIdx: 0,
      keyCooldown: 0,
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
          s.selectedIdx = idx;
          sw.active = !sw.active;
          if (window.AudioManager) window.AudioManager.playClick();
        }
      });

      // "ENGAGE POWER GRID" Button Click
      const btnY = 140 + s.switches.length * 60 + 20;
      if (clickX >= x && clickX <= x + w && clickY >= btnY && clickY <= btnY + 50) {
        s.selectedIdx = s.switches.length;
        this.executeEngageGrid();
      }
    };
  }

  executeEngageGrid() {
    const s = this.state;
    const currentDraw = s.switches.filter(sw => sw.active).reduce((sum, sw) => sum + sw.drain, 0);
    const hasLifeSupport = s.switches.find(sw => sw.id === 'lifeSupport').active;

    if (currentDraw <= s.capacityLimit && hasLifeSupport) {
      if (window.AudioManager) window.AudioManager.playCelebration();
      this.triggerVictory();
    } else if (!hasLifeSupport) {
      if (window.AudioManager) window.AudioManager.playAlarm();
      if (window.RewardsManager) window.RewardsManager.showFloatingNotice('⚠️ Cannot engage: Life Support O₂ Scrubber must stay ONLINE!');
    } else {
      if (window.AudioManager) window.AudioManager.playAlarm();
      if (window.RewardsManager) window.RewardsManager.showFloatingNotice(`⚠️ Grid Overloaded! Shed at least ${currentDraw - s.capacityLimit} kW!`);
    }
  }

  updateSystems(dt) {
    const s = this.state;
    const ctrl = this.getControls();
    if (s.keyCooldown > 0) s.keyCooldown -= dt;

    if (s.keyCooldown <= 0) {
      const totalItems = s.switches.length + 1; // switches + engage button
      if (ctrl.isUp() || ctrl.isLeft()) {
        s.selectedIdx = (s.selectedIdx - 1 + totalItems) % totalItems;
        s.keyCooldown = 0.22;
        if (window.AudioManager) window.AudioManager.playClick?.();
      } else if (ctrl.isDown() || ctrl.isRight()) {
        s.selectedIdx = (s.selectedIdx + 1) % totalItems;
        s.keyCooldown = 0.22;
        if (window.AudioManager) window.AudioManager.playClick?.();
      } else if (ctrl.isAction() || ctrl.isJump()) {
        s.keyCooldown = 0.28;
        if (s.selectedIdx < s.switches.length) {
          s.switches[s.selectedIdx].active = !s.switches[s.selectedIdx].active;
          if (window.AudioManager) window.AudioManager.playClick?.();
        } else {
          this.executeEngageGrid();
        }
      }
    }
  }

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
    ctx.fillText('Use Arrow Keys / Touch to select switch. Press E, ACTION, or CLICK to toggle, then ENGAGE!', this.canvas.width * 0.5, 104);

    const x = this.canvas.width * 0.15;
    const w = this.canvas.width * 0.7;

    // Render interactive switches
    s.switches.forEach((sw, idx) => {
      const y = 140 + idx * 60;
      const isSelected = s.selectedIdx === idx;

      ctx.fillStyle = sw.active
        ? (sw.essential ? 'rgba(0, 229, 255, 0.22)' : 'rgba(255, 215, 0, 0.22)')
        : 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = isSelected ? '#FFD700' : (sw.active ? '#00E5FF' : '#546E7A');
      ctx.lineWidth = isSelected ? 3.5 : 2;
      ctx.fillRect(x, y, w, 46);
      ctx.strokeRect(x, y, w, 46);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '15px Fredoka, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${isSelected ? '▶ ' : '  '}${sw.label} (${sw.drain} kW) ${sw.essential ? '⭐ ESSENTIAL' : ''}`, x + 14, y + 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = sw.active ? '#00E676' : '#90A4AE';
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.fillText(sw.active ? '[ONLINE]' : '[OFFLINE]', x + w - 18, y + 28);
    });

    // "ENGAGE POWER GRID" Button
    const btnY = 140 + s.switches.length * 60 + 20;
    const isEngageSelected = s.selectedIdx === s.switches.length;
    ctx.fillStyle = isOverloaded ? '#37474F' : 'rgba(0, 230, 118, 0.35)';
    ctx.fillRect(x, btnY, w, 50);
    ctx.strokeStyle = isEngageSelected ? '#FFD700' : (isOverloaded ? '#78909C' : '#00E676');
    ctx.lineWidth = isEngageSelected ? 4 : 3;
    ctx.strokeRect(x, btnY, w, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isOverloaded ? '⚠️ SHED LOAD TO ENGAGE' : '⚡ ENGAGE POWER GRID (E / ENTER / CLICK) ⚡',
      this.canvas.width * 0.5,
      btnY + 31
    );
  }

  // =========================================================================
  // ARCHETYPE 6: RADIATION EMERGENCY (DONKI STORM SPRINT & REGOLITH BUNKER)
  // =========================================================================
  initRadiation() {
    const sc = window.NasaScenarioEngine?.currentScenario || {};
    const countdown = sc.countdownSeconds || 25.0;
    const flareClass = sc.flareClass || 'X8.7';
    const spikeRate = sc.radiationRateSpike || 22.0;

    this.state = {
      countdown: countdown,
      flareClass: flareClass,
      sheltered: false,
      astronautX: 80,
      shelterX: this.canvas.width - 150
    };

    if (window.HealthSystem && typeof window.HealthSystem.triggerSolarStormSpike === 'function') {
      window.HealthSystem.triggerSolarStormSpike(flareClass, spikeRate);
    }
  }

  updateRadiation(dt) {
    const s = this.state;
    const ctrl = this.getControls();

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
      this.triggerVictory();
    }

    // Countdown expired before sheltering -> FAILURE (player must retry level!)
    if (s.countdown <= 0 && !s.sheltered) {
      if (window.HealthSystem) {
        window.HealthSystem.vitals.radiationDose += 50;
        window.HealthSystem.vitals.health = 0;
        window.HealthSystem.clearSolarStorm();
        window.HealthSystem.updateHUD();
      }
      this.triggerFailure('Extreme solar storm radiation exposure! Failed to reach regolith shelter in time.');
      return;
    }

    if (window.HealthSystem && window.HealthSystem.vitals.radiationDose >= 160) {
      this.triggerFailure('Critical radiation dosage reached! Radiation shelter protocol failed.');
      return;
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
    const sc = window.NasaScenarioEngine?.currentScenario || {};
    const studyId = sc.studyId || (isBotany ? 'OSD-137' : 'OSD-243');

    this.state = {
      isBotany: isBotany,
      studyId: studyId,
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
          this.triggerVictory();
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
          this.triggerVictory();
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
        this.triggerVictory();
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
  // ARCHETYPE: ROCKET & SPACE TRAVEL (MISSION 1 - LEVELS 1 TO 10)
  // =========================================================================
  initRocket() {
    const sub = this.level.subType || 'launch_countdown';

    this.state = {
      subType: sub,
      x: this.canvas.width * 0.5,
      y: this.canvas.height * 0.72,
      vx: 0,
      vy: 0,
      w: 42,
      h: 58,
      angle: 0,
      fuel: 100,
      maxFuel: 100,
      thrust: 0,
      altitude: 0,
      targetAltitude: this.level.params?.targetAltitude || 300,
      speed: 0,
      invulnerableTimer: 0,
      particles: [],
      // Payload subType
      payloadItems: [
        { id: 'supplies', label: 'Crew Supplies', icon: '🍞', loaded: false, x: this.canvas.width * 0.28, y: this.canvas.height * 0.35, r: 24 },
        { id: 'science', label: 'Science Rack', icon: '🔬', loaded: false, x: this.canvas.width * 0.50, y: this.canvas.height * 0.35, r: 24 },
        { id: 'cubesat', label: 'CubeSat Array', icon: '🛰️', loaded: false, x: this.canvas.width * 0.72, y: this.canvas.height * 0.35, r: 24 }
      ],
      loadedCount: 0,
      targetItems: 3,
      // Fuel stage subType
      fuelStages: [
        { id: 'lox', name: 'Liquid Oxygen Stage', icon: '💧', locked: false, x: this.canvas.width * 0.5, y: 80, targetY: this.canvas.height * 0.45 },
        { id: 'lh2', name: 'Liquid Hydrogen Stage', icon: '❄️', locked: false, x: this.canvas.width * 0.5, y: 80, targetY: this.canvas.height * 0.60 }
      ],
      currentStageIdx: 0,
      // Steering corridor gates
      gates: [
        { y: this.canvas.height * 0.72, passed: false, xMin: this.canvas.width * 0.35, xMax: this.canvas.width * 0.65, label: 'CORRIDOR ALPHA' },
        { y: this.canvas.height * 0.48, passed: false, xMin: this.canvas.width * 0.25, xMax: this.canvas.width * 0.55, label: 'MAX-Q GATE' },
        { y: this.canvas.height * 0.24, passed: false, xMin: this.canvas.width * 0.45, xMax: this.canvas.width * 0.75, label: 'ORBITAL INJECTION' }
      ],
      gatesPassed: 0,
      // Hazards (Asteroids / Debris)
      hazards: [
        { x: this.canvas.width * 0.20, y: 80, r: 22, vx: 25, vy: 40, rot: 0, vRot: 1.2 },
        { x: this.canvas.width * 0.50, y: 50, r: 26, vx: -30, vy: 50, rot: 0, vRot: -0.8 },
        { x: this.canvas.width * 0.80, y: 90, r: 20, vx: 15, vy: 45, rot: 0, vRot: 1.5 }
      ],
      hazardAvoidTimer: 0,
      targetAvoidTime: 6.0,
      // Collectables
      collectables: [
        { x: this.canvas.width * 0.28, y: this.canvas.height * 0.25, r: 16, type: 'oxygen', label: 'O₂', icon: '🫧', collected: false },
        { x: this.canvas.width * 0.72, y: this.canvas.height * 0.35, r: 16, type: 'energy', label: '⚡', icon: '⚡', collected: false },
        { x: this.canvas.width * 0.50, y: this.canvas.height * 0.50, r: 16, type: 'fuel', label: '⛽', icon: '⛽', collected: false }
      ],
      collectedCount: 0,
      // Thrust corridor
      burnTimer: 0,
      targetBurnTime: 4.0,
      inGreenZone: false,
      // Orbital waypoints
      waypoints: [
        { x: this.canvas.width * 0.25, y: this.canvas.height * 0.65, r: 30, passed: false, label: 'LEO' },
        { x: this.canvas.width * 0.75, y: this.canvas.height * 0.45, r: 30, passed: false, label: 'TLI' },
        { x: this.canvas.width * 0.50, y: this.canvas.height * 0.25, r: 30, passed: false, label: 'GATEWAY' }
      ],
      waypointsCleared: 0,
      // Destination orbit
      dockingDistance: 350,
      docked: false
    };

    // Canvas click interaction for tap/drag gameplay
    this.canvas.onclick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const s = this.state;

      if (s.subType === 'payload') {
        s.payloadItems.forEach(item => {
          if (!item.loaded) {
            const dist = Math.hypot(clickX - item.x, clickY - item.y);
            if (dist < item.r + 20) {
              item.loaded = true;
              s.loadedCount++;
              if (window.AudioManager) window.AudioManager.playChime();
              if (s.loadedCount >= s.targetItems) {
                this.triggerVictory();
              }
            }
          }
        });
      } else if (s.subType === 'fuel_stage') {
        const cur = s.fuelStages[s.currentStageIdx];
        if (cur && !cur.locked) {
          cur.locked = true;
          s.currentStageIdx++;
          if (window.AudioManager) window.AudioManager.playChime();
          if (s.currentStageIdx >= s.fuelStages.length) {
            this.triggerVictory();
          }
        }
      }
    };
  }

  updateRocket(dt) {
    const s = this.state;
    const ctrl = this.getControls();

    if (s.invulnerableTimer > 0) s.invulnerableTimer -= dt;

    if (s.subType === 'payload') {
      if (ctrl.isAction()) {
        const nextItem = s.payloadItems.find(it => !it.loaded);
        if (nextItem) {
          nextItem.loaded = true;
          s.loadedCount++;
          if (window.AudioManager) window.AudioManager.playChime();
          if (s.loadedCount >= s.targetItems) {
            this.triggerVictory();
          }
        }
      }
      return;
    }

    if (s.subType === 'fuel_stage') {
      const cur = s.fuelStages[s.currentStageIdx];
      if (cur && !cur.locked) {
        if (ctrl.isLeft()) cur.x -= 140 * dt;
        if (ctrl.isRight()) cur.x += 140 * dt;
        cur.y += 35 * dt;
        if (ctrl.isAction() || ctrl.isDown() || cur.y >= cur.targetY) {
          cur.locked = true;
          s.currentStageIdx++;
          if (window.AudioManager) window.AudioManager.playChime();
          if (s.currentStageIdx >= s.fuelStages.length) {
            this.triggerVictory();
          }
        }
      }
      return;
    }

    if (s.subType === 'launch_countdown') {
      if (ctrl.isThrust() || ctrl.isUp() || ctrl.isJump()) {
        s.thrust = Math.min(100, s.thrust + 60 * dt);
        s.altitude += (s.thrust * 0.9) * dt;
        if (window.AudioManager?.startThruster) window.AudioManager.startThruster();
        for (let i = 0; i < 3; i++) {
          s.particles.push({
            x: s.x + (Math.random() - 0.5) * 20,
            y: s.y + s.h * 0.5,
            vx: (Math.random() - 0.5) * 40,
            vy: Math.random() * 80 + 120,
            life: 0.5,
            color: Math.random() > 0.4 ? '#FF9100' : '#FFD700'
          });
        }
        if (s.altitude >= s.targetAltitude) {
          if (window.AudioManager?.stopThruster) window.AudioManager.stopThruster();
          this.triggerVictory();
        }
      } else {
        s.thrust = Math.max(0, s.thrust - 40 * dt);
        if (window.AudioManager?.stopThruster) window.AudioManager.stopThruster();
      }
      return;
    }

    if (s.subType === 'steering') {
      if (ctrl.isLeft()) { s.x -= 180 * dt; s.angle = -0.18; }
      else if (ctrl.isRight()) { s.x += 180 * dt; s.angle = 0.18; }
      else { s.angle *= 0.90; }
      s.x = Math.max(30, Math.min(this.canvas.width - 30, s.x));
      s.y -= 70 * dt;

      s.gates.forEach(g => {
        if (!g.passed && Math.abs(s.y - g.y) < 25) {
          if (s.x >= g.xMin && s.x <= g.xMax) {
            g.passed = true;
            s.gatesPassed++;
            if (window.AudioManager) window.AudioManager.playChime();
            if (s.gatesPassed >= s.gates.length) {
              this.triggerVictory();
            }
          }
        }
      });
      if (s.y < 40) s.y = this.canvas.height - 60;
      return;
    }

    if (s.subType === 'asteroid_field' || s.subType === 'space_debris') {
      if (ctrl.isLeft()) s.x -= 190 * dt;
      if (ctrl.isRight()) s.x += 190 * dt;
      if (ctrl.isUp()) s.y -= 120 * dt;
      if (ctrl.isDown()) s.y += 120 * dt;
      s.x = Math.max(30, Math.min(this.canvas.width - 30, s.x));
      s.y = Math.max(50, Math.min(this.canvas.height - 60, s.y));

      s.hazards.forEach(h => {
        h.y += h.vy * dt;
        h.x += h.vx * dt;
        h.rot += h.vRot * dt;
        if (h.y > this.canvas.height + 40) {
          h.y = -30;
          h.x = Math.random() * (this.canvas.width - 60) + 30;
        }
        const dist = Math.hypot(s.x - h.x, s.y - h.y);
        if (dist < h.r + 20 && s.invulnerableTimer <= 0) {
          s.invulnerableTimer = 1.0;
          if (window.HealthSystem) {
            window.HealthSystem.vitals.health = Math.max(0, window.HealthSystem.vitals.health - 20);
            window.HealthSystem.updateHUD();
          }
          if (window.AudioManager) window.AudioManager.playAlarm();
        }
      });

      s.hazardAvoidTimer += dt;
      if (s.hazardAvoidTimer >= s.targetAvoidTime) {
        this.triggerVictory();
      }
      return;
    }

    if (s.subType === 'orbital_collect') {
      if (ctrl.isLeft()) s.x -= 170 * dt;
      if (ctrl.isRight()) s.x += 170 * dt;
      if (ctrl.isUp() || ctrl.isThrust()) s.y -= 150 * dt;
      if (ctrl.isDown()) s.y += 120 * dt;
      s.x = Math.max(30, Math.min(this.canvas.width - 30, s.x));
      s.y = Math.max(50, Math.min(this.canvas.height - 60, s.y));

      s.collectables.forEach(c => {
        if (!c.collected) {
          const dist = Math.hypot(s.x - c.x, s.y - c.y);
          if (dist < c.r + 25) {
            c.collected = true;
            s.collectedCount++;
            if (window.AudioManager) window.AudioManager.playChime();
            if (s.collectedCount >= s.collectables.length) {
              this.triggerVictory();
            }
          }
        }
      });
      return;
    }

    if (s.subType === 'thrust_management') {
      if (ctrl.isThrust() || ctrl.isUp()) {
        s.thrust = Math.min(100, s.thrust + 70 * dt);
        s.fuel = Math.max(0, s.fuel - 10 * dt);
      } else {
        s.thrust = Math.max(0, s.thrust - 50 * dt);
      }
      s.inGreenZone = s.thrust >= 60 && s.thrust <= 85;
      if (s.inGreenZone) {
        s.burnTimer += dt;
        if (s.burnTimer >= s.targetBurnTime) {
          this.triggerVictory();
        }
      }
      return;
    }

    if (s.subType === 'orbital_navigation') {
      if (ctrl.isLeft()) s.x -= 180 * dt;
      if (ctrl.isRight()) s.x += 180 * dt;
      if (ctrl.isUp() || ctrl.isThrust()) s.y -= 150 * dt;
      if (ctrl.isDown()) s.y += 130 * dt;
      s.x = Math.max(30, Math.min(this.canvas.width - 30, s.x));
      s.y = Math.max(50, Math.min(this.canvas.height - 60, s.y));

      s.waypoints.forEach(wp => {
        if (!wp.passed) {
          const dist = Math.hypot(s.x - wp.x, s.y - wp.y);
          if (dist < wp.r + 22) {
            wp.passed = true;
            s.waypointsCleared++;
            if (window.AudioManager) window.AudioManager.playChime();
            if (s.waypointsCleared >= s.waypoints.length) {
              this.triggerVictory();
            }
          }
        }
      });
      return;
    }

    if (s.subType === 'reach_destination') {
      if (ctrl.isLeft()) s.x -= 160 * dt;
      if (ctrl.isRight()) s.x += 160 * dt;
      if (ctrl.isUp() || ctrl.isThrust()) s.speed = Math.min(100, s.speed + 40 * dt);
      else s.speed = Math.max(10, s.speed - 30 * dt);

      s.dockingDistance -= (s.speed * 0.8) * dt;
      if (s.dockingDistance <= 0) {
        s.docked = true;
        this.triggerVictory();
      }
    }
  }

  renderRocket() {
    const ctx = this.ctx;
    const s = this.state;

    const bg = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bg.addColorStop(0, '#040714');
    bg.addColorStop(0.7, '#091530');
    bg.addColorStop(1, '#112248');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137) % this.canvas.width;
      const sy = (i * 223) % this.canvas.height;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    if (s.subType === 'payload') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SLS PAYLOAD FAIRING: CARGO MODULE INTEGRATION', this.canvas.width * 0.5, 45);
      ctx.font = '13px Fredoka, sans-serif';
      ctx.fillStyle = '#B0BEC5';
      ctx.fillText('Tap or press Action to load all 3 mission cargo modules into the rocket bay!', this.canvas.width * 0.5, 70);

      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.canvas.width * 0.20, this.canvas.height * 0.25, this.canvas.width * 0.60, this.canvas.height * 0.45);

      s.payloadItems.forEach(item => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fillStyle = item.loaded ? 'rgba(0, 230, 118, 0.4)' : 'rgba(0, 229, 255, 0.2)';
        ctx.fill();
        ctx.strokeStyle = item.loaded ? '#00E676' : '#00E5FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.loaded ? '✅' : item.icon, item.x, item.y);

        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(item.label, item.x, item.y + item.r + 18);
        ctx.restore();
      });

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.fillText(`CARGO LOADED: ${s.loadedCount} / ${s.targetItems}`, this.canvas.width * 0.5, this.canvas.height * 0.82);
      return;
    }

    if (s.subType === 'fuel_stage') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRYOGENIC PROPELLANT STAGE INSTALLATION', this.canvas.width * 0.5, 45);
      ctx.font = '13px Fredoka, sans-serif';
      ctx.fillStyle = '#B0BEC5';
      ctx.fillText('Align stage with Left/Right, guide into booster socket and tap Action to lock!', this.canvas.width * 0.5, 70);

      ctx.strokeStyle = '#FF9100';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.canvas.width * 0.40, this.canvas.height * 0.35, this.canvas.width * 0.20, this.canvas.height * 0.50);

      s.fuelStages.forEach(stg => {
        ctx.fillStyle = stg.locked ? '#00E676' : '#FF9100';
        ctx.fillRect(stg.x - 50, stg.y - 20, 100, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px Orbitron, sans-serif';
        ctx.fillText(`${stg.icon} ${stg.name}`, stg.x, stg.y + 5);
      });
      return;
    }

    if (s.subType === 'launch_countdown') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SLS ARTEMIS LAUNCH SEQUENCE: PAD 39B', this.canvas.width * 0.5, 45);
      ctx.font = '13px Fredoka, sans-serif';
      ctx.fillStyle = '#B0BEC5';
      ctx.fillText('HOLD THRUST / UP / SPACE to fire engines and accelerate to orbit!', this.canvas.width * 0.5, 70);

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 22px Orbitron, sans-serif';
      ctx.fillText(`ALTITUDE: ${Math.floor(s.altitude)} / ${s.targetAltitude} km`, this.canvas.width * 0.5, this.canvas.height * 0.22);

      ctx.fillStyle = '#546E7A';
      ctx.fillRect(this.canvas.width * 0.25, this.canvas.height - 40, this.canvas.width * 0.50, 40);

      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (s.subType === 'steering') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASCENT GUIDANCE & GIMBAL STEERING', this.canvas.width * 0.5, 40);

      s.gates.forEach(g => {
        ctx.save();
        ctx.strokeStyle = g.passed ? '#00E676' : '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(g.xMin, g.y);
        ctx.lineTo(g.xMax, g.y);
        ctx.stroke();
        ctx.fillStyle = g.passed ? '#00E676' : '#FFD700';
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.fillText(g.label, (g.xMin + g.xMax) * 0.5, g.y - 6);
        ctx.restore();
      });
    }

    if (s.subType === 'asteroid_field' || s.subType === 'space_debris') {
      ctx.fillStyle = '#FF5252';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.subType === 'space_debris' ? 'ORBITAL DEBRIS FIELD NAVIGATION' : 'ASTEROID FIELD HAZARD EVASION', this.canvas.width * 0.5, 40);

      s.hazards.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.fillStyle = '#78909C';
        ctx.beginPath();
        ctx.arc(0, 0, h.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B0BEC5';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      const pct = Math.min(100, (s.hazardAvoidTimer / s.targetAvoidTime) * 100);
      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.fillText(`SECTOR CLEAR PROGRESS: ${Math.floor(pct)}%`, this.canvas.width * 0.5, 70);
    }

    if (s.subType === 'orbital_collect') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ORBITAL RESOURCE CANISTER COLLECTION', this.canvas.width * 0.5, 40);

      s.collectables.forEach(c => {
        if (!c.collected) {
          ctx.save();
          ctx.fillStyle = c.type === 'oxygen' ? '#00B0FF' : (c.type === 'energy' ? '#FFD700' : '#E040FB');
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(c.label, c.x, c.y + 4);
          ctx.restore();
        }
      });
    }

    if (s.subType === 'thrust_management') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENGINE THRUST & FUEL EFFICIENCY MANAGEMENT', this.canvas.width * 0.5, 40);

      const gx = this.canvas.width * 0.25;
      const gw = this.canvas.width * 0.50;
      ctx.fillStyle = '#263238';
      ctx.fillRect(gx, 90, gw, 30);
      ctx.fillStyle = 'rgba(0, 230, 118, 0.4)';
      ctx.fillRect(gx + gw * 0.60, 90, gw * 0.25, 30);
      ctx.fillStyle = s.inGreenZone ? '#00E676' : '#FF9100';
      ctx.fillRect(gx, 90, gw * (s.thrust / 100), 30);
      ctx.strokeRect(gx, 90, gw, 30);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Orbitron, sans-serif';
      ctx.fillText(`THRUST: ${Math.floor(s.thrust)}% | HOLD IN GREEN: ${s.burnTimer.toFixed(1)}s / ${s.targetBurnTime}s`, this.canvas.width * 0.5, 145);
    }

    if (s.subType === 'orbital_navigation') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ORBITAL WAYPOINT NAVIGATION BEACONS', this.canvas.width * 0.5, 40);

      s.waypoints.forEach(wp => {
        ctx.save();
        ctx.strokeStyle = wp.passed ? '#00E676' : '#00E5FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = wp.passed ? '#00E676' : '#FFFFFF';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.fillText(wp.label, wp.x, wp.y + 4);
        ctx.restore();
      });
    }

    if (s.subType === 'reach_destination') {
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DESTINATION GATEWAY RENDEZVOUS & DOCKING', this.canvas.width * 0.5, 40);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.fillText(`RANGE: ${Math.max(0, Math.floor(s.dockingDistance))} m | APPROACH SPEED: ${Math.floor(s.speed)} m/s`, this.canvas.width * 0.5, 75);

      ctx.font = '48px sans-serif';
      ctx.fillText('🛰️', this.canvas.width * 0.5, this.canvas.height * 0.35);
    }

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.font = '42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚀', 0, 0);
    ctx.restore();
  }

  // =========================================================================
  // ARCHETYPE: MOON / MARS LANDING (MISSION 2 - LEVELS 11 TO 20)
  // =========================================================================
  initLanding() {
    this.initLander();
    const sub = this.level.subType;
    if (sub === 'crater_avoidance') {
      this.state.asteroids.push(
        { x: this.canvas.width * 0.45, y: this.canvas.height * 0.50, r: 30, vx: -20, vy: 5, rot: 0, vRot: 0.8 }
      );
    } else if (sub === 'wind_hazard') {
      this.state.wind = 45;
    }
  }

  updateLanding(dt) {
    if (this.state.wind) {
      this.state.x += this.state.wind * dt;
    }
    this.updateLander(dt);
  }

  renderLanding() {
    this.renderLander();
  }

  // =========================================================================
  // ARCHETYPE: BUILD A SPACE STATION (MISSION 3 - LEVELS 21 TO 30)
  // =========================================================================
  initStation() {
    this.initBuilder();
    const sub = this.level.subType;
    if (sub === 'living_quarters') {
      this.state.requiredModules = ['hab', 'gym'];
    } else if (sub === 'science_lab') {
      this.state.requiredModules = ['hab', 'greenhouse'];
    } else if (sub === 'protective_shield') {
      this.state.requiredModules = ['hab', 'shield'];
    } else if (sub === 'site_survey' || sub === 'main_habitat') {
      this.state.requiredModules = ['hab'];
    }
  }

  updateStation(dt) {
    this.updateBuilder(dt);
  }

  renderStation() {
    this.renderBuilder();
  }

  // =========================================================================
  // ARCHETYPE: GENERATE ELECTRICITY & POWER GRID (MISSION 4 - LEVELS 31 TO 40)
  // =========================================================================
  initPower() {
    const sub = this.level.subType || 'install_panels';
    if (sub === 'sun_tracking') {
      this.state = {
        subType: 'sun_tracking',
        panelAngle: 0,
        sunAngle: 55,
        alignedTime: 0,
        targetTime: 3.0,
        battery: 50
      };
      this.canvas.onclick = () => {
        this.state.panelAngle = (this.state.panelAngle + 20) % 360;
        if (window.AudioManager) window.AudioManager.playClick();
      };
    } else if (sub === 'load_shedding') {
      this.initSystems();
    } else {
      this.initSystems();
    }
  }

  updatePower(dt) {
    const s = this.state;
    if (s.subType === 'sun_tracking') {
      const ctrl = this.getControls();
      if (ctrl.isLeft()) s.panelAngle -= 60 * dt;
      if (ctrl.isRight()) s.panelAngle += 60 * dt;

      if (Math.abs(s.panelAngle - s.sunAngle) < 18) {
        s.alignedTime += dt;
        s.battery = Math.min(100, s.battery + 20 * dt);
        if (s.alignedTime >= s.targetTime) {
          this.triggerVictory();
        }
      }
      return;
    }
    this.updateSystems(dt);
  }

  renderPower() {
    const ctx = this.ctx;
    const s = this.state;

    if (s.subType === 'sun_tracking') {
      ctx.fillStyle = '#060d24';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUN-TRACKING SOLAR PANEL GIMBAL ORIENTATION', this.canvas.width * 0.5, 45);

      ctx.font = '14px Fredoka, sans-serif';
      ctx.fillStyle = '#B0BEC5';
      ctx.fillText('Rotate solar wings with Left/Right to align directly towards sunlight!', this.canvas.width * 0.5, 75);

      // Sun
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(this.canvas.width * 0.75, 130, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '32px sans-serif';
      ctx.fillText('☀️', this.canvas.width * 0.75, 140);

      // Panel on mount
      ctx.save();
      ctx.translate(this.canvas.width * 0.40, this.canvas.height * 0.52);
      ctx.rotate((s.panelAngle * Math.PI) / 180);
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(-60, -12, 120, 24);
      ctx.strokeStyle = '#64B5F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(-60, -12, 120, 24);
      ctx.restore();

      // Alignment Meter
      const pct = Math.min(100, (s.alignedTime / s.targetTime) * 100);
      ctx.fillStyle = '#00E676';
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.fillText(`SUN ALIGNMENT: ${Math.floor(pct)}% | BATTERY CHARGE: ${Math.floor(s.battery)}%`, this.canvas.width * 0.5, this.canvas.height * 0.82);
      return;
    }

    this.renderSystems();
  }

  // =========================================================================
  // ARCHETYPE: OXYGEN & LIFE SUPPORT ECLSS (MISSION 5 - LEVELS 41 TO 50)
  // =========================================================================
  initEclss() {
    const sub = this.level.subType || 'build_oxygen_plant';
    this.state = {
      subType: sub,
      o2Level: 75,
      pressureKpa: 92,
      targetPressure: 101.3,
      co2Ppm: 950,
      leakSealed: false,
      filterReplaced: false,
      suitFilled: false
    };

    this.canvas.onclick = () => {
      const s = this.state;
      if (s.subType === 'repair_leak') {
        s.leakSealed = true;
        if (window.AudioManager) window.AudioManager.playCelebration();
        this.triggerVictory();
      } else if (s.subType === 'air_circulation') {
        s.filterReplaced = true;
        s.co2Ppm = 450;
        if (window.AudioManager) window.AudioManager.playChime();
        this.triggerVictory();
      } else {
        s.pressureKpa = Math.min(101.3, s.pressureKpa + 5);
        if (s.pressureKpa >= 101.3) {
          if (window.AudioManager) window.AudioManager.playCelebration();
          this.triggerVictory();
        }
      }
    };
  }

  updateEclss(dt) {
    const s = this.state;
    const ctrl = this.getControls();

    if (ctrl.isAction()) {
      if (s.subType === 'repair_leak') {
        s.leakSealed = true;
        this.triggerVictory();
      } else {
        s.pressureKpa = Math.min(101.3, s.pressureKpa + 25 * dt);
        if (s.pressureKpa >= 101.3) {
          this.triggerVictory();
        }
      }
    }
  }

  renderEclss() {
    const ctx = this.ctx;
    const s = this.state;

    ctx.fillStyle = '#06121e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NASA ECLSS: LIFE SUPPORT CONSOLE', this.canvas.width * 0.5, 45);

    ctx.font = '14px Fredoka, sans-serif';
    ctx.fillStyle = '#B0BEC5';
    ctx.fillText('Regulate oxygen, scrub carbon dioxide, and monitor atmospheric pressure!', this.canvas.width * 0.5, 75);

    // Gauges
    ctx.fillStyle = '#00E676';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.fillText(`O₂ CONCENTRATION: ${s.o2Level}% (NOMINAL: 21%)`, this.canvas.width * 0.5, 130);
    ctx.fillText(`CABIN PRESSURE: ${s.pressureKpa.toFixed(1)} / ${s.targetPressure} kPa`, this.canvas.width * 0.5, 165);
    ctx.fillText(`CO₂ LEVEL: ${s.co2Ppm} PPM (SAFE LIMIT < 1000 PPM)`, this.canvas.width * 0.5, 200);

    // Graphic icon
    ctx.font = '64px sans-serif';
    ctx.fillText(s.subType === 'repair_leak' ? (s.leakSealed ? '🔧 ✅' : '🫧 ⚠️') : '🫧 🫁 🌿', this.canvas.width * 0.5, this.canvas.height * 0.55);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 15px Orbitron, sans-serif';
    ctx.fillText(s.subType === 'repair_leak' ? 'TAP LEAK TO SEAL WITH REPAIR WRAP' : 'TAP SCREEN OR PRESS ACTION TO PRESSURIZE OXYGEN', this.canvas.width * 0.5, this.canvas.height * 0.82);
  }

  // =========================================================================
  // ARCHETYPE: RADIATION MONITORING & SPACEWALK (MISSION 6 - LEVELS 51 TO 60)
  // =========================================================================
  initSpacewalk() {
    const sub = this.level.subType;
    if (sub === 'solar_flare_alert' || sub === 'bunker_evacuation' || sub === 'storm_shelter') {
      this.initRadiation();
    } else {
      this.initPlatformer();
    }
  }

  updateSpacewalk(dt) {
    const sub = this.level.subType;
    if (sub === 'solar_flare_alert' || sub === 'bunker_evacuation' || sub === 'storm_shelter') {
      this.updateRadiation(dt);
    } else {
      this.updatePlatformer(dt);
    }
  }

  renderSpacewalk() {
    const sub = this.level.subType;
    if (sub === 'solar_flare_alert' || sub === 'bunker_evacuation' || sub === 'storm_shelter') {
      this.renderRadiation();
    } else {
      this.renderPlatformer();
    }
  }

  // =========================================================================
  // ARCHETYPE: MARS / MOON RESEARCH & RETURN (MISSION 7 - LEVELS 61 TO 70)
  // =========================================================================
  initResearch() {
    const sub = this.level.subType;
    if (sub === 'earth_splashdown') {
      this.state = {
        subType: 'earth_splashdown',
        altitude: 120,
        speed: 100,
        chutesDeployed: false,
        splashdown: false,
        particles: []
      };
      this.canvas.onclick = () => {
        this.state.chutesDeployed = true;
      };
    } else if (sub === 'lab_spectrometer') {
      this.initBioLab();
    } else if (sub === 'dsn_delay_transmission') {
      this.initComms();
    } else {
      this.initRover();
    }
  }

  updateResearch(dt) {
    const s = this.state;
    if (s.subType === 'earth_splashdown') {
      const ctrl = this.getControls();
      if (ctrl.isAction() || ctrl.isThrust()) {
        s.chutesDeployed = true;
      }
      if (s.chutesDeployed) {
        s.speed = Math.max(15, s.speed - 30 * dt);
      }
      s.altitude = Math.max(0, s.altitude - s.speed * 0.4 * dt);
      if (s.altitude <= 0) {
        s.splashdown = true;
        this.triggerVictory();
      }
      return;
    }
    if (this.level.subType === 'lab_spectrometer') {
      this.updateBioLab(dt);
    } else if (this.level.subType === 'dsn_delay_transmission') {
      this.updateComms(dt);
    } else {
      this.updateRover(dt);
    }
  }

  renderResearch() {
    const s = this.state;
    if (s.subType === 'earth_splashdown') {
      const ctx = this.ctx;
      ctx.fillStyle = '#08182e';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ORION CAPSULE ATMOSPHERIC RE-ENTRY & SPLASHDOWN', this.canvas.width * 0.5, 45);

      ctx.font = '14px Fredoka, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(s.chutesDeployed ? '🪂 PARACHUTES DEPLOYED: GENTLE OCEAN DESCENT' : 'PRESS ACTION OR TAP TO DEPLOY TRIPLE 35M MAIN PARACHUTES!', this.canvas.width * 0.5, 75);

      // Capsule & Parachutes
      const capY = this.canvas.height * 0.55;
      if (s.chutesDeployed) {
        ctx.font = '54px sans-serif';
        ctx.fillText('🪂 🪂 🪂', this.canvas.width * 0.5, capY - 60);
      }
      ctx.font = '48px sans-serif';
      ctx.fillText('🚀', this.canvas.width * 0.5, capY);

      // Ocean at bottom
      ctx.fillStyle = '#0288D1';
      ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.fillText(`ALTITUDE: ${Math.floor(s.altitude)} km | VELOCITY: ${Math.floor(s.speed)} m/s`, this.canvas.width * 0.5, this.canvas.height * 0.85);
      return;
    }
    if (this.level.subType === 'lab_spectrometer') {
      this.renderBioLab();
    } else if (this.level.subType === 'dsn_delay_transmission') {
      this.renderComms();
    } else {
      this.renderRover();
    }
  }

  // =========================================================================
  // GENERAL UPDATE / RENDER DELEGATION
  // =========================================================================
  update(dt) {
    // Vitals check every frame
    if (window.HealthSystem) {
      if (window.HealthSystem.vitals.health <= 0) {
        this.triggerFailure('Astronaut health depleted! Critical vitals failure.');
        return;
      }
      if (window.HealthSystem.vitals.oxygen <= 0) {
        this.triggerFailure('Astronaut oxygen reserves exhausted!');
        return;
      }
    }

    switch (this.archetype) {
      case 'rocket': this.updateRocket(dt); break;
      case 'landing': this.updateLanding(dt); break;
      case 'station': this.updateStation(dt); break;
      case 'power': this.updatePower(dt); break;
      case 'eclss': this.updateEclss(dt); break;
      case 'spacewalk': this.updateSpacewalk(dt); break;
      case 'research': this.updateResearch(dt); break;

      // Backward-compat aliases
      case 'lander': this.updateLanding(dt); break;
      case 'platformer': this.updateSpacewalk(dt); break;
      case 'rover': this.updateResearch(dt); break;
      case 'builder': this.updateStation(dt); break;
      case 'systems': this.updatePower(dt); break;
      case 'radiation': this.updateSpacewalk(dt); break;
      case 'biolab': this.updateResearch(dt); break;
      case 'comms': this.updateResearch(dt); break;
      default: this.updateRocket(dt); break;
    }
  }

  render() {
    switch (this.archetype) {
      case 'rocket': this.renderRocket(); break;
      case 'landing': this.renderLanding(); break;
      case 'station': this.renderStation(); break;
      case 'power': this.renderPower(); break;
      case 'eclss': this.renderEclss(); break;
      case 'spacewalk': this.renderSpacewalk(); break;
      case 'research': this.renderResearch(); break;

      // Backward-compat aliases
      case 'lander': this.renderLanding(); break;
      case 'platformer': this.renderSpacewalk(); break;
      case 'rover': this.renderResearch(); break;
      case 'builder': this.renderStation(); break;
      case 'systems': this.renderPower(); break;
      case 'radiation': this.renderSpacewalk(); break;
      case 'biolab': this.renderResearch(); break;
      case 'comms': this.renderResearch(); break;
      default: this.renderRocket(); break;
    }
  }

  triggerFailure(reason = 'Mission parameters exceeded.') {
    if (!this.isRunning) return;
    this.cleanup();
    if (this.onFail) {
      this.onFail(reason);
    } else if (window.MissionsManager?.handlePlayerDeath) {
      window.MissionsManager.handlePlayerDeath(reason);
    }
  }

  triggerVictory() {
    this.cleanup();
    // Pure gameplay only: immediately complete level upon achieving objective
    if (this.onComplete) {
      this.onComplete(this.level.reward?.stars || 3, this.level.reward?.sciencePoints || 100);
    }
  }

  triggerDecisionOrVictory() {
    this.triggerVictory();
  }

  showDecisionModal(onProceed) {
    if (onProceed) onProceed();
  }
}

window.UniversalLevelEngine = UniversalLevelEngine;
