/**
 * Main Game Entrypoint
 * Coordinates subsystems and initializes the interactive game lifecycle.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌌 Starting Junior Astronaut Mission Trainer...');

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

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.01
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep space gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0518');
    grad.addColorStop(0.6, '#1e0b24');
    grad.addColorStop(1, '#47141f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Twinkling stars
    stars.forEach((s) => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant Martian Red Planet Arc
    ctx.save();
    ctx.fillStyle = '#8f2e1a';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.5, canvas.height + canvas.width * 0.45, canvas.width * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(loop);
  }
  loop();
}

