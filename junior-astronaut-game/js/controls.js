/**
 * Universal Child-Friendly Input & Controls System
 * Supports Keyboard (WASD / Arrow Keys / Space / E / Enter), Touchscreen buttons, and Mouse interactions.
 */

const ControlsManager = {
  keys: {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    action: false,
    thrust: false
  },

  activeArchetype: 'platformer',
  activeLevelIndex: 1,

  init() {
    this.bindKeyboard();
    this.bindTouchButtons();
    console.log('🎮 Controls Manager initialized with full query API.');
  },

  // Query Methods (Used by Level Engine)
  isLeft() { return !!this.keys.left; },
  isRight() { return !!this.keys.right; },
  isUp() { return !!this.keys.up; },
  isDown() { return !!this.keys.down; },
  isJump() { return !!this.keys.jump; },
  isThrust() { return !!this.keys.thrust; },
  isAction() { return !!this.keys.action; },

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser default scrolling during active gameplay
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        if (document.body.classList.contains('in-game')) {
          e.preventDefault();
        }
      }

      // Keyboard controls when Level Complete modal is visible
      if (window.MissionsManager?.gameState === 'LEVEL_COMPLETED') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          const nextBtn = document.getElementById('btn-complete-next');
          if (nextBtn) nextBtn.click();
          return;
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          const retryBtn = document.getElementById('btn-complete-retry');
          if (retryBtn) retryBtn.click();
          return;
        }
      }

      // Keyboard controls when Mission Failed / Game Over modal is visible
      if (window.MissionsManager?.gameState === 'GAME_OVER') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          const retryBtn = document.getElementById('btn-failed-retry');
          if (retryBtn) retryBtn.click();
          return;
        }
        if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          const exitBtn = document.getElementById('btn-failed-exit');
          if (exitBtn) exitBtn.click();
          return;
        }
      }

      // Escape toggles pause during active gameplay
      if (e.key === 'Escape') {
        if (window.GameEngine?.togglePause) {
          window.GameEngine.togglePause();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.keys.up = true;
          this.keys.jump = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          break;
        case ' ':
        case 'Spacebar':
          this.keys.jump = true;
          this.keys.up = true;
          break;
        case 'Shift':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.thrust = true;
          break;
        case 'e':
        case 'E':
        case 'Enter':
          this.keys.action = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = false;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.keys.up = false;
          this.keys.jump = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = false;
          break;
        case ' ':
        case 'Spacebar':
          this.keys.jump = false;
          this.keys.up = false;
          break;
        case 'Shift':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.thrust = false;
          break;
        case 'e':
        case 'E':
        case 'Enter':
          this.keys.action = false;
          break;
      }
    });

    // Reset controls if user switches window or tab
    window.addEventListener('blur', () => this.reset());
  },

  bindTouchButtons() {
    const bindBtn = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;

      const press = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[keyName] = true;
        if (keyName === 'jump' || keyName === 'thrust') {
          this.keys.up = true;
        }
        el.classList.add('active-pressed');
        if (window.AudioManager) window.AudioManager.playClick();
      };

      const release = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[keyName] = false;
        if (keyName === 'jump' || keyName === 'thrust') {
          this.keys.up = false;
        }
        el.classList.remove('active-pressed');
      };

      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release, { passive: false });
      el.addEventListener('touchcancel', release, { passive: false });
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
      el.addEventListener('mouseleave', release);
    };

    bindBtn('touch-btn-left', 'left');
    bindBtn('touch-btn-right', 'right');
    bindBtn('touch-btn-jump', 'jump');
    bindBtn('touch-btn-thrust', 'thrust');
    bindBtn('touch-btn-action', 'action');
  },

  /**
   * Dynamically adapt touch button labels and ensure all 5 are active per archetype
   */
  adaptForArchetype(archetype) {
    this.activeArchetype = archetype;
    const touchPanel = document.getElementById('mobile-controls-bar');
    const btnLeft = document.getElementById('touch-btn-left');
    const btnRight = document.getElementById('touch-btn-right');
    const btnJump = document.getElementById('touch-btn-jump');
    const btnThrust = document.getElementById('touch-btn-thrust');
    const btnAction = document.getElementById('touch-btn-action');

    if (!touchPanel) return;

    // Ensure all 5 controls are always visible
    [btnLeft, btnRight, btnJump, btnThrust, btnAction].forEach(b => {
      if (b) b.classList.remove('hidden');
    });

    switch (archetype) {
      case 'rocket':
        if (btnLeft) btnLeft.innerHTML = '⬅️ GIMBAL L';
        if (btnRight) btnRight.innerHTML = '➡️ GIMBAL R';
        if (btnJump) btnJump.innerHTML = '⬆️ RETRO';
        if (btnThrust) btnThrust.innerHTML = '🚀 THRUST';
        if (btnAction) btnAction.innerHTML = '🎯 ENGAGE';
        break;

      case 'landing':
      case 'lander':
        if (btnLeft) btnLeft.innerHTML = '⮌ TILT L';
        if (btnRight) btnRight.innerHTML = '⮎ TILT R';
        if (btnJump) btnJump.innerHTML = '⬆️ RETRO';
        if (btnThrust) btnThrust.innerHTML = '🚀 THRUST';
        if (btnAction) btnAction.innerHTML = '🎯 GEAR';
        break;

      case 'station':
      case 'builder':
        if (btnLeft) btnLeft.innerHTML = '⬅️ PREV';
        if (btnRight) btnRight.innerHTML = '➡️ NEXT';
        if (btnJump) btnJump.innerHTML = '🔄 ROTATE';
        if (btnThrust) btnThrust.innerHTML = '✨ BUILD';
        if (btnAction) btnAction.innerHTML = '🎯 DOCK';
        break;

      case 'power':
      case 'systems':
        if (btnLeft) btnLeft.innerHTML = '⬅️ PREV SW';
        if (btnRight) btnRight.innerHTML = '➡️ NEXT SW';
        if (btnJump) btnJump.innerHTML = '⚡ TOGGLE';
        if (btnThrust) btnThrust.innerHTML = '⚡ SHED LOAD';
        if (btnAction) btnAction.innerHTML = '🎯 ENGAGE';
        break;

      case 'eclss':
        if (btnLeft) btnLeft.innerHTML = '⬅️ VALVE L';
        if (btnRight) btnRight.innerHTML = '➡️ VALVE R';
        if (btnJump) btnJump.innerHTML = '🫧 O2 BOOST';
        if (btnThrust) btnThrust.innerHTML = '🔧 SEAL LEAK';
        if (btnAction) btnAction.innerHTML = '🎯 ENGAGE';
        break;

      case 'spacewalk':
      case 'platformer':
      case 'radiation':
        if (btnLeft) btnLeft.innerHTML = '⬅️ LEFT';
        if (btnRight) btnRight.innerHTML = '➡️ RIGHT';
        if (btnJump) btnJump.innerHTML = '⬆️ LOW-G HOP';
        if (btnThrust) btnThrust.innerHTML = '🚀 JETPACK';
        if (btnAction) btnAction.innerHTML = '🛡️ SHELTER';
        break;

      case 'research':
      case 'rover':
      case 'biolab':
      case 'comms':
        if (btnLeft) btnLeft.innerHTML = '⬅️ REVERSE';
        if (btnRight) btnRight.innerHTML = '➡️ DRIVE';
        if (btnJump) btnJump.innerHTML = '⬆️ BOOST';
        if (btnThrust) btnThrust.innerHTML = '📡 DSN PING';
        if (btnAction) btnAction.innerHTML = '⛏️ DRILL / SAMPLE';
        break;

      default:
        if (btnLeft) btnLeft.innerHTML = '⬅️ LEFT';
        if (btnRight) btnRight.innerHTML = '➡️ RIGHT';
        if (btnJump) btnJump.innerHTML = '⬆️ JUMP';
        if (btnThrust) btnThrust.innerHTML = '🚀 THRUST';
        if (btnAction) btnAction.innerHTML = '🎯 ENGAGE';
        break;
    }
  },

  reset() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      action: false,
      thrust: false
    };
    document.querySelectorAll('.touch-btn').forEach(b => b.classList.remove('active-pressed'));
  }
};

window.ControlsManager = ControlsManager;
