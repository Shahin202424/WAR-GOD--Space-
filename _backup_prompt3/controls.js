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
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        if (document.body.classList.contains('in-game')) {
          e.preventDefault();
        }
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
          this.keys.thrust = true;
          this.keys.jump = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          break;
        case ' ':
          this.keys.jump = true;
          this.keys.thrust = true;
          this.keys.action = true;
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
          this.keys.thrust = false;
          this.keys.jump = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = false;
          break;
        case ' ':
          this.keys.jump = false;
          this.keys.thrust = false;
          this.keys.action = false;
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
   * Dynamically adapt touch button labels and visibility based on archetype
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

    // Default visibility
    if (btnLeft) {
      btnLeft.classList.remove('hidden');
      btnLeft.innerHTML = '⬅️ LEFT';
    }
    if (btnRight) {
      btnRight.classList.remove('hidden');
      btnRight.innerHTML = '➡️ RIGHT';
    }
    if (btnJump) btnJump.classList.add('hidden');
    if (btnThrust) btnThrust.classList.add('hidden');
    if (btnAction) btnAction.classList.remove('hidden');

    switch (archetype) {
      case 'lander':
        if (btnJump) btnJump.classList.add('hidden');
        if (btnThrust) {
          btnThrust.classList.remove('hidden');
          btnThrust.innerHTML = '🚀 THRUST';
        }
        if (btnLeft) btnLeft.innerHTML = '⮌ TILT L';
        if (btnRight) btnRight.innerHTML = '⮎ TILT R';
        if (btnAction) btnAction.classList.add('hidden');
        break;

      case 'platformer':
        if (btnJump) {
          btnJump.classList.remove('hidden');
          btnJump.innerHTML = '⬆️ JUMP / JETPACK';
        }
        if (btnAction) {
          btnAction.classList.remove('hidden');
          btnAction.innerHTML = '💎 COLLECT';
        }
        break;

      case 'rover':
        if (btnLeft) btnLeft.innerHTML = '⬅️ REVERSE';
        if (btnRight) btnRight.innerHTML = '➡️ DRIVE';
        if (btnJump) btnJump.classList.add('hidden');
        if (btnAction) {
          btnAction.classList.remove('hidden');
          btnAction.innerHTML = '⛏️ DRILL CORE';
        }
        break;

      case 'radiation':
        if (btnLeft) btnLeft.innerHTML = '⬅️ RUN';
        if (btnRight) btnRight.innerHTML = '➡️ SPRINT';
        if (btnJump) btnJump.classList.add('hidden');
        if (btnAction) {
          btnAction.classList.remove('hidden');
          btnAction.innerHTML = '🛡️ ENTER BUNKER';
        }
        break;

      case 'builder':
      case 'systems':
      case 'biolab':
      case 'comms':
        // Tap/click archetypes
        if (btnLeft) btnLeft.classList.add('hidden');
        if (btnRight) btnRight.classList.add('hidden');
        if (btnJump) btnJump.classList.add('hidden');
        if (btnThrust) btnThrust.classList.add('hidden');
        if (btnAction) {
          btnAction.classList.remove('hidden');
          btnAction.innerHTML = '🎯 ENGAGE';
        }
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
