/**
 * Story Video & Animated Introduction Engine
 * Plays an engaging 15-30s animated story sequence before each level:
 * - Animated celestial background (Moon, Mars, Deep Space, Launch)
 * - Astro Alex character guide with animated speech & captions
 * - Mission objective & real NASA scientific connection
 * - Authentic NASA imagery
 * - "Start Mission", "Skip Story", "Replay Story" controls
 */

const StoryEngine = {
  currentMission: null,
  currentLevel: null,
  onCompleteCallback: null,
  animId: null,
  typewriterTimer: null,
  speechTimeout: null,
  narrationUtterance: null,

  playStory(missionData, levelData, onStartCallback) {
    this.currentMission = missionData;
    this.currentLevel = levelData;
    this.onCompleteCallback = onStartCallback;

    const modal = document.getElementById('story-intro-modal');
    if (!modal) {
      // Fallback if modal DOM element doesn't exist yet
      if (onStartCallback) onStartCallback();
      return;
    }

    modal.classList.remove('hidden');

    // Populate mission metadata
    const elMissionTag = document.getElementById('story-mission-tag');
    const elTitle = document.getElementById('story-level-title');
    const elObjective = document.getElementById('story-objective-text');
    const elNasaBadge = document.getElementById('story-nasa-badge');
    const elPhotoImg = document.getElementById('story-nasa-photo');
    const elPhotoCap = document.getElementById('story-photo-caption');

    if (elMissionTag) elMissionTag.textContent = `MISSION ${missionData.id}: ${missionData.name.toUpperCase()}`;
    if (elTitle) elTitle.textContent = `Level ${levelData.levelInMission}: ${levelData.title}`;
    if (elObjective) elObjective.textContent = levelData.objective;
    if (elNasaBadge) {
      const sc = window.NasaScenarioEngine?.currentScenario;
      const status = sc?.dataStatus || 'CACHED';
      elNasaBadge.innerHTML = `🛰️ ${levelData.nasaConnection} <span class="data-status-pill status-${status.toLowerCase().replace(/\s+/g, '-')}">${status}</span>`;
    }

    // Select authentic NASA photograph based on celestial body
    if (elPhotoImg) {
      let photoUrl = 'assets/images/mars-landscape.svg';
      let caption = 'NASA Planetary Exploration';

      if (window.NasaImages?.cachedPhotos?.length > 0) {
        let photo = null;
        if (missionData.id <= 3) photo = window.NasaImages.getPhotoByCategory('rocket') || window.NasaImages.getPhotoByCategory('spacewalk');
        else if (missionData.id <= 5 || missionData.id === 14) photo = window.NasaImages.getPhotoByCategory('moon');
        else photo = window.NasaImages.getPhotoByCategory('rover') || window.NasaImages.getPhotoByCategory('surface');

        if (photo) {
          photoUrl = photo.url;
          caption = `${photo.title} (${photo.center || 'NASA'})`;
        }
      }
      elPhotoImg.src = photoUrl;
      if (elPhotoCap) elPhotoCap.textContent = caption;
    }

    // Start background canvas animation
    this.initStoryCanvas(missionData.id);

    // Start animated narration & speech
    this.startNarration();

    // Bind control buttons
    const btnStart = document.getElementById('btn-story-start');
    const btnSkip = document.getElementById('btn-story-skip');
    const btnReplay = document.getElementById('btn-story-replay');

    if (btnStart) {
      btnStart.onclick = () => this.finishStory();
    }
    if (btnSkip) {
      btnSkip.onclick = () => this.finishStory();
    }
    if (btnReplay) {
      btnReplay.onclick = () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.startNarration();
      };
    }
  },

  startNarration() {
    this.stopNarration();

    const storyText = this.currentLevel.story;
    const textContainer = document.getElementById('story-narrative-text');
    if (!textContainer) return;

    textContainer.textContent = '';
    let charIdx = 0;

    // Typewriter effect
    this.typewriterTimer = setInterval(() => {
      if (charIdx < storyText.length) {
        textContainer.textContent += storyText[charIdx];
        charIdx++;
      } else {
        clearInterval(this.typewriterTimer);
      }
    }, 28);

    // Guide character emotion
    const avatarEl = document.getElementById('story-guide-avatar');
    if (avatarEl) {
      avatarEl.textContent = '🧑‍🚀';
    }

    if (window.AudioManager) {
      window.AudioManager.playGuideSpeech();
    }

    // Optional child-friendly Web Speech API
    try {
      if ('speechSynthesis' in window && !window.AudioManager?.isMuted) {
        window.speechSynthesis.cancel();
        const shortSpeech = `${this.currentLevel.title}. ${this.currentLevel.objective}`;
        this.narrationUtterance = new SpeechSynthesisUtterance(shortSpeech);
        this.narrationUtterance.pitch = 1.2;
        this.narrationUtterance.rate = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
        if (engVoice) this.narrationUtterance.voice = engVoice;
        window.speechSynthesis.speak(this.narrationUtterance);
      }
    } catch (e) {
      // Speech synthesis is progressive enhancement
    }
  },

  stopNarration() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  },

  cancelStory() {
    this.stopNarration();
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    const modal = document.getElementById('story-intro-modal');
    if (modal) modal.classList.add('hidden');

    this.onCompleteCallback = null;
  },

  finishStory() {
    this.stopNarration();
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    const modal = document.getElementById('story-intro-modal');
    if (modal) modal.classList.add('hidden');

    if (window.AudioManager) {
      window.AudioManager.playClick();
    }

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  },

  initStoryCanvas(missionId) {
    const canvas = document.getElementById('story-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = canvas.parentElement.clientHeight || 450;

    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.3 ? '#FFFFFF' : (missionId >= 15 ? '#FF8A65' : '#80D8FF')
      });
    }

    let craftX = -50;
    const isMars = missionId >= 15;
    const isMoon = missionId >= 4 && missionId <= 5 || missionId === 14;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isMars) {
        grad.addColorStop(0, '#0c071e');
        grad.addColorStop(0.7, '#240d1a');
        grad.addColorStop(1, '#501a18');
      } else if (isMoon) {
        grad.addColorStop(0, '#050716');
        grad.addColorStop(0.8, '#0d1326');
        grad.addColorStop(1, '#1b233a');
      } else {
        grad.addColorStop(0, '#07051a');
        grad.addColorStop(0.7, '#140c2e');
        grad.addColorStop(1, '#003366');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving stars
      stars.forEach(s => {
        s.x -= s.speed * 2.5;
        if (s.x < 0) s.x = canvas.width;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant celestial sphere (Planet / Moon)
      ctx.save();
      if (isMars) {
        // Red Planet
        const planetGrad = ctx.createRadialGradient(canvas.width * 0.85, canvas.height * 0.3, 10, canvas.width * 0.85, canvas.height * 0.3, 90);
        planetGrad.addColorStop(0, '#ff7043');
        planetGrad.addColorStop(0.7, '#d84315');
        planetGrad.addColorStop(1, '#3e140d');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.85, canvas.height * 0.3, 90, 0, Math.PI * 2);
        ctx.fill();
      } else if (isMoon) {
        // Gray Craters Moon
        const moonGrad = ctx.createRadialGradient(canvas.width * 0.85, canvas.height * 0.3, 10, canvas.width * 0.85, canvas.height * 0.3, 85);
        moonGrad.addColorStop(0, '#eceff1');
        moonGrad.addColorStop(0.8, '#78909c');
        moonGrad.addColorStop(1, '#263238');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.85, canvas.height * 0.3, 85, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Earth Crescent
        const earthGrad = ctx.createRadialGradient(canvas.width * 0.85, canvas.height * 0.3, 10, canvas.width * 0.85, canvas.height * 0.3, 85);
        earthGrad.addColorStop(0, '#4fc3f7');
        earthGrad.addColorStop(0.6, '#0288d1');
        earthGrad.addColorStop(1, '#012850');
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.85, canvas.height * 0.3, 85, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Animated orbiting spacecraft
      craftX += 1.2;
      if (craftX > canvas.width + 60) craftX = -50;
      ctx.save();
      ctx.translate(craftX, canvas.height * 0.45 + Math.sin(craftX * 0.03) * 15);
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚀', 0, 0);
      ctx.restore();

      this.animId = requestAnimationFrame(render);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(render);
  }
};

window.StoryEngine = StoryEngine;

