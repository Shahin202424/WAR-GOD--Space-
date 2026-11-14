const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../js/level-engine.js');
let code = fs.readFileSync(targetFile, 'utf8');

const archetypesMethods = `
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
      ctx.fillText(\`CARGO LOADED: \${s.loadedCount} / \${s.targetItems}\`, this.canvas.width * 0.5, this.canvas.height * 0.82);
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
        ctx.fillText(\`\${stg.icon} \${stg.name}\`, stg.x, stg.y + 5);
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
      ctx.fillText(\`ALTITUDE: \${Math.floor(s.altitude)} / \${s.targetAltitude} km\`, this.canvas.width * 0.5, this.canvas.height * 0.22);

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
      ctx.fillText(\`SECTOR CLEAR PROGRESS: \${Math.floor(pct)}%\`, this.canvas.width * 0.5, 70);
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
      ctx.fillText(\`THRUST: \${Math.floor(s.thrust)}% | HOLD IN GREEN: \${s.burnTimer.toFixed(1)}s / \${s.targetBurnTime}s\`, this.canvas.width * 0.5, 145);
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
      ctx.fillText(\`RANGE: \${Math.max(0, Math.floor(s.dockingDistance))} m | APPROACH SPEED: \${Math.floor(s.speed)} m/s\`, this.canvas.width * 0.5, 75);

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
      ctx.fillText(\`SUN ALIGNMENT: \${Math.floor(pct)}% | BATTERY CHARGE: \${Math.floor(s.battery)}%\`, this.canvas.width * 0.5, this.canvas.height * 0.82);
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
    ctx.fillText(\`O₂ CONCENTRATION: \${s.o2Level}% (NOMINAL: 21%)\`, this.canvas.width * 0.5, 130);
    ctx.fillText(\`CABIN PRESSURE: \${s.pressureKpa.toFixed(1)} / \${s.targetPressure} kPa\`, this.canvas.width * 0.5, 165);
    ctx.fillText(\`CO₂ LEVEL: \${s.co2Ppm} PPM (SAFE LIMIT < 1000 PPM)\`, this.canvas.width * 0.5, 200);

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
      ctx.fillText(\`ALTITUDE: \${Math.floor(s.altitude)} km | VELOCITY: \${Math.floor(s.speed)} m/s\`, this.canvas.width * 0.5, this.canvas.height * 0.85);
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
`;

// Insert right before "// =========================================================================\n  // GENERAL UPDATE / RENDER DELEGATION"
const marker = '  // =========================================================================\n  // GENERAL UPDATE / RENDER DELEGATION';
if (!code.includes(marker)) {
  console.error('Could not find insertion marker!');
  process.exit(1);
}

code = code.replace(marker, archetypesMethods + '\n' + marker);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully patched js/level-engine.js with all 7 archetypes!');

