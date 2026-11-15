/**
 * Main Game Entrypoint
 * Coordinates subsystems and initializes the interactive game lifecycle.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 Starting SPACE WARS...');

  // Initialize universal controls
  if (window.ControlsManager) {
    window.ControlsManager.init();
  }

  // Initialize Game Engine
  if (window.GameEngine) {
    window.GameEngine.init();
  }

  // Bind HUD NASA Telemetry Status listener
  window.addEventListener('nasa-data-updated', (e) => {
    const report = e.detail;
    const pill = document.getElementById('hud-nasa-telemetry-pill');
    if (pill && report) {
      const status = report.aggregateStatus || 'DEMO MODE';
      pill.className = `hud-telemetry-pill status-${status.toLowerCase().replace(/\s+/g, '-')}`;
      pill.innerHTML = `<span class="status-dot"></span> NASA: ${status}`;
    }
  });

  // Animated Background Stars on Home Canvas
  initHomeBackground();
});

function initHomeBackground() {
  const canvas = document.getElementById('home-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Layer 1: Micro dust stars (Distant background)
  const distantStars = [];
  for (let i = 0; i < 110; i++) {
    distantStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 0.9 + 0.5,
      alpha: Math.random() * 0.6 + 0.2
    });
  }

  // Layer 2: Mid-range twinkling stars with authentic spectral tints
  const spectralColors = ['#FFFFFF', '#E0F7FA', '#FFF9C4', '#B3E5FC', '#FFECB3'];
  const midStars = [];
  for (let i = 0; i < 65; i++) {
    midStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.8,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.008,
      color: spectralColors[Math.floor(Math.random() * spectralColors.length)]
    });
  }

  // Layer 3: Bright milestone stars with 4-point diffraction cross
  const brightStars = [];
  for (let i = 0; i < 16; i++) {
    brightStars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      r: Math.random() * 1.2 + 1.8,
      alpha: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 0.015 + 0.005,
      spikeLen: Math.random() * 6 + 6
    });
  }

  // Drifting Cosmic Nebula Clouds
  const nebulae = [
    { x: width * 0.2, y: height * 0.3, r: Math.max(width, height) * 0.35, color: 'rgba(74, 20, 140, 0.18)', vx: 0.08, vy: 0.04 },
    { x: width * 0.8, y: height * 0.4, r: Math.max(width, height) * 0.40, color: 'rgba(0, 96, 100, 0.16)', vx: -0.06, vy: 0.05 },
    { x: width * 0.5, y: height * 0.2, r: Math.max(width, height) * 0.30, color: 'rgba(13, 71, 161, 0.15)', vx: 0.04, vy: -0.04 }
  ];

  // Orbiting Spacecraft / Satellite
  const satellite = {
    x: width * 0.1,
    y: height * 0.22,
    vx: 0.35,
    vy: -0.05,
    beaconTimer: 0
  };

  // Occasional Shooting Star
  const meteor = {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    len: 0,
    alpha: 0,
    timer: 180
  };

  let frameCount = 0;

  function loop() {
    frameCount++;
    ctx.clearRect(0, 0, width, height);

    // 1. Deep Space Obsidian Abyss
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#02040a');
    baseGrad.addColorStop(0.5, '#060b1e');
    baseGrad.addColorStop(1, '#0a1128');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Animated Cosmic Nebula Clouds
    nebulae.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -100 || n.x > width + 100) n.vx *= -1;
      if (n.y < -100 || n.y > height + 100) n.vy *= -1;

      const nGrad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
      nGrad.addColorStop(0, n.color);
      nGrad.addColorStop(0.6, n.color.replace(/[\d\.]+\)$/, '0.06)'));
      nGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Layer 1: Distant micro stars
    distantStars.forEach(s => {
      ctx.fillStyle = `rgba(220, 235, 255, ${s.alpha})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    });

    // 4. Layer 2: Mid-range twinkling stars
    midStars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.15) s.speed = -s.speed;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.abs(s.alpha);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 5. Layer 3: Bright milestone stars with diffraction spikes
    brightStars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.3) s.speed = -s.speed;
      const a = Math.abs(s.alpha);

      // Star core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow
      const gGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      gGrad.addColorStop(0, `rgba(0, 229, 255, ${a * 0.7})`);
      gGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // 4-point diffraction spike
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.45})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x - s.spikeLen, s.y);
      ctx.lineTo(s.x + s.spikeLen, s.y);
      ctx.moveTo(s.x, s.y - s.spikeLen);
      ctx.lineTo(s.x, s.y + s.spikeLen);
      ctx.stroke();
    });

    // 6. Realistic Earth Visible from Space with Atmospheric Limb Glow
    const earthCenterX = width * 0.5;
    const earthRadius = Math.max(width * 0.7, 520);
    const earthCenterY = height + earthRadius * 0.58;

    // Earth Outer Atmospheric Limb Glow
    const atmoGlow = ctx.createRadialGradient(
      earthCenterX, earthCenterY, earthRadius * 0.96,
      earthCenterX, earthCenterY, earthRadius * 1.06
    );
    atmoGlow.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
    atmoGlow.addColorStop(0.35, 'rgba(0, 176, 255, 0.35)');
    atmoGlow.addColorStop(0.7, 'rgba(30, 136, 229, 0.15)');
    atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = atmoGlow;
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius * 1.06, 0, Math.PI * 2);
    ctx.fill();

    // Earth Ocean Sphere
    const earthOcean = ctx.createRadialGradient(
      earthCenterX - earthRadius * 0.25, earthCenterY - earthRadius * 0.45, earthRadius * 0.2,
      earthCenterX, earthCenterY, earthRadius
    );
    earthOcean.addColorStop(0, '#1976D2');
    earthOcean.addColorStop(0.4, '#0D47A1');
    earthOcean.addColorStop(0.85, '#051937');
    earthOcean.addColorStop(1, '#020A16');
    ctx.fillStyle = earthOcean;
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    // Earth Continental Contours (Stylized Landmass & Cloud Belts)
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
    ctx.clip();

    // Continents
    ctx.fillStyle = 'rgba(46, 125, 50, 0.45)';
    ctx.beginPath();
    ctx.ellipse(earthCenterX - earthRadius * 0.35, earthCenterY - earthRadius * 0.75, earthRadius * 0.28, earthRadius * 0.16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(earthCenterX + earthRadius * 0.25, earthCenterY - earthRadius * 0.78, earthRadius * 0.32, earthRadius * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Swirling Cloud Formations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.beginPath();
    ctx.ellipse(earthCenterX - earthRadius * 0.15, earthCenterY - earthRadius * 0.88, earthRadius * 0.45, earthRadius * 0.08, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(earthCenterX + earthRadius * 0.28, earthCenterY - earthRadius * 0.82, earthRadius * 0.38, earthRadius * 0.06, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Distant Moon / Lunar Crescent
    const moonX = width * 0.85;
    const moonY = height * 0.18;
    const moonR = Math.min(width, height) * 0.045;

    const moonGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, 2, moonX, moonY, moonR);
    moonGrad.addColorStop(0, '#ECEFF1');
    moonGrad.addColorStop(0.7, '#90A4AE');
    moonGrad.addColorStop(1, '#37474F');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Subtle moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 2.2);
    moonGlow.addColorStop(0, 'rgba(236, 239, 241, 0.25)');
    moonGlow.addColorStop(1, 'rgba(236, 239, 241, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 8. Orbiting Spacecraft / Satellite with Strobe Beacon
    satellite.x += satellite.vx;
    satellite.y += satellite.vy;
    if (satellite.x > width + 80) {
      satellite.x = -80;
      satellite.y = Math.random() * (height * 0.4) + height * 0.1;
    }

    ctx.save();
    ctx.translate(satellite.x, satellite.y);
    ctx.rotate(0.12);

    // Spacecraft Body
    ctx.fillStyle = '#CFD8DC';
    ctx.fillRect(-6, -3, 12, 6);

    // Solar Arrays (Blue photovoltaic grid)
    ctx.fillStyle = '#00B0FF';
    ctx.fillRect(-22, -4, 13, 8);
    ctx.fillRect(9, -4, 13, 8);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-22, -4, 13, 8);
    ctx.strokeRect(9, -4, 13, 8);

    // Strobe Beacon LEDs (Flashing red & green)
    satellite.beaconTimer += 0.06;
    const beaconOn = Math.sin(satellite.beaconTimer * 4) > 0.3;
    if (beaconOn) {
      // Red port beacon
      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.arc(-22, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      // Green starboard beacon
      ctx.fillStyle = '#00E676';
      ctx.beginPath();
      ctx.arc(22, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 9. Occasional Shooting Star / Meteor Streak
    meteor.timer--;
    if (meteor.timer <= 0 && !meteor.active) {
      meteor.active = true;
      meteor.x = Math.random() * (width * 0.8) + width * 0.1;
      meteor.y = Math.random() * (height * 0.35);
      meteor.vx = Math.random() * 8 + 10;
      meteor.vy = Math.random() * 5 + 6;
      meteor.len = Math.random() * 70 + 80;
      meteor.alpha = 1.0;
      meteor.timer = Math.floor(Math.random() * 240) + 240;
    }

    if (meteor.active) {
      ctx.save();
      const mGrad = ctx.createLinearGradient(
        meteor.x, meteor.y,
        meteor.x - meteor.vx * (meteor.len / 12), meteor.y - meteor.vy * (meteor.len / 12)
      );
      mGrad.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
      mGrad.addColorStop(0.3, `rgba(0, 229, 255, ${meteor.alpha * 0.7})`);
      mGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.strokeStyle = mGrad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(
        meteor.x - meteor.vx * (meteor.len / 12),
        meteor.y - meteor.vy * (meteor.len / 12)
      );
      ctx.stroke();

      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.alpha -= 0.035;

      if (meteor.alpha <= 0) {
        meteor.active = false;
      }
      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  loop();
}

