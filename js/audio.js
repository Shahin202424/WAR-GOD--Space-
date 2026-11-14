/**
 * Web Audio API Procedural Sound Engine
 * Zero-dependency, offline-capable synthesizer for space music and retro effects.
 * Complies with browser autoplay policy (initializes on first user interaction).
 */

const AudioManager = {
  ctx: null,
  isMuted: false,
  isBgmPlaying: false,
  bgmGain: null,
  sfxGain: null,
  bgmInterval: null,
  activeThrusterOsc: null,
  activeThrusterGain: null,
  activeRoverOsc: null,
  activeRoverGain: null,

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.25;
    this.sfxGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.12;
    this.bgmGain.connect(this.ctx.destination);

    // Load mute preference
    const savedMute = localStorage.getItem('junior_astro_sound_muted');
    if (savedMute === 'true') {
      this.mute();
    }
  },

  resumeContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleSound() {
    if (this.isMuted) {
      this.unmute();
      return true;
    } else {
      this.mute();
      return false;
    }
  },

  mute() {
    this.isMuted = true;
    if (this.sfxGain) this.sfxGain.gain.value = 0;
    if (this.bgmGain) this.bgmGain.gain.value = 0;
    this.stopThruster();
    this.stopRoverMotor();
    localStorage.setItem('junior_astro_sound_muted', 'true');
    this.updateSoundButtonUI(false);
  },

  unmute() {
    this.isMuted = false;
    if (this.sfxGain) this.sfxGain.gain.value = 0.25;
    if (this.bgmGain) this.bgmGain.gain.value = 0.12;
    localStorage.setItem('junior_astro_sound_muted', 'false');
    this.updateSoundButtonUI(true);
    if (!this.isBgmPlaying) this.startSpaceMusic();
  },

  updateSoundButtonUI(isOn) {
    const btn = document.getElementById('hud-sound-toggle');
    const settingsBtn = document.getElementById('settings-sound-btn');
    const text = isOn ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    const icon = isOn ? '🔊' : '🔇';
    if (btn) btn.textContent = icon;
    if (settingsBtn) settingsBtn.textContent = text;
  },

  playClick() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  },

  playJump() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  },

  playPickup() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + idx * 0.06;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  },

  playChime() {
    this.playPickup();
  },

  startThruster() {
    if (this.isMuted || this.activeThrusterOsc) return;
    this.resumeContext();
    if (!this.ctx) return;

    this.activeThrusterOsc = this.ctx.createOscillator();
    this.activeThrusterGain = this.ctx.createGain();
    this.activeThrusterOsc.type = 'sawtooth';
    this.activeThrusterOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

    this.activeThrusterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.activeThrusterOsc.connect(this.activeThrusterGain);
    this.activeThrusterGain.connect(this.sfxGain);
    this.activeThrusterOsc.start();
  },

  stopThruster() {
    if (this.activeThrusterOsc) {
      try {
        this.activeThrusterOsc.stop();
        this.activeThrusterOsc.disconnect();
      } catch (e) {}
      this.activeThrusterOsc = null;
      this.activeThrusterGain = null;
    }
  },

  startRoverMotor() {
    if (this.isMuted || this.activeRoverOsc) return;
    this.resumeContext();
    if (!this.ctx) return;

    this.activeRoverOsc = this.ctx.createOscillator();
    this.activeRoverGain = this.ctx.createGain();
    this.activeRoverOsc.type = 'triangle';
    this.activeRoverOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

    this.activeRoverGain.gain.setValueAtTime(0.07, this.ctx.currentTime);

    this.activeRoverOsc.connect(this.activeRoverGain);
    this.activeRoverGain.connect(this.sfxGain);
    this.activeRoverOsc.start();
  },

  stopRoverMotor() {
    if (this.activeRoverOsc) {
      try {
        this.activeRoverOsc.stop();
        this.activeRoverOsc.disconnect();
      } catch (e) {}
      this.activeRoverOsc = null;
      this.activeRoverGain = null;
    }
  },

  playAlarm() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);
    osc.frequency.setValueAtTime(950, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  },

  playFailure() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const notes = [440, 370, 311, 220];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const t = this.ctx.currentTime + idx * 0.12;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  },

  playSiren() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  },

  playCelebration() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const fanfare = [
      { note: 261.63, dur: 0.15, delay: 0 },    // C4
      { note: 329.63, dur: 0.15, delay: 0.15 }, // E4
      { note: 392.00, dur: 0.15, delay: 0.30 }, // G4
      { note: 523.25, dur: 0.40, delay: 0.45 }, // C5
      { note: 659.25, dur: 0.20, delay: 0.85 }, // E5
      { note: 783.99, dur: 0.60, delay: 1.05 }  // G5
    ];

    fanfare.forEach((f) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f.note;

      const t = this.ctx.currentTime + f.delay;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + f.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + f.dur);
    });
  },

  playGuideSpeech() {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freqs = [440, 523, 587, 659, 784];
    const chosen = freqs[Math.floor(Math.random() * freqs.length)];
    osc.frequency.setValueAtTime(chosen, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(chosen + 100, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },

  startSpaceMusic() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    const chordProgression = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.00, 523.25], // Cmaj7
      [196.00, 246.94, 293.66, 392.00]  // Gmaj
    ];

    let step = 0;
    const playChord = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      const notes = chordProgression[step % chordProgression.length];
      step++;

      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 3800);
  },

  stopSpaceMusic() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
};

window.AudioManager = AudioManager;
