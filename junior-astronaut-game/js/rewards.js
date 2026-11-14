/**
 * Rewards, Badges, Progression and Gamification Module
 * Supports all 7 Major Missions × 10 Levels = 70 Levels:
 * - 210 Total Stars (3 stars per level)
 * - Science XP progression
 * - 7 Collectible Mission Badges
 * - 6 Astronaut Ranks: Cadet -> Interplanetary Fleet Commander
 * - Official Graduation Certificate unlock (strictly after 70 levels)
 * - LocalStorage progress persistence
 */

const RewardsManager = {
  storageKey: 'junior_astronaut_save_v2',
  state: {
    astronautName: 'Leo',
    cadetId: 'leo',
    cadetAvatar: '🧑‍🚀',
    cadetRole: 'Rocket Flight Pilot',
    suitColor: 'orange', // orange | blue | pink | green | white
    difficulty: 'scientist', // easy | scientist | hard
    stars: 0,
    sciencePoints: 0,
    currentGlobalLevel: 1,
    unlockedLevels: [1],
    badges: [],
    levelStars: {}, // { 1: 3, 2: 3, ... 70: 3 }
    certificateUnlocked: false,
    certificateId: null
  },

  ranks: [
    { minLevels: 0, title: 'Cadet', icon: '🧑‍🚀' },
    { minLevels: 10, title: 'Flight Specialist', icon: '🚀' },
    { minLevels: 20, title: 'Lunar Commander', icon: '🌖' },
    { minLevels: 35, title: 'Deep Space Pioneer', icon: '🌌' },
    { minLevels: 50, title: 'Mars Explorer', icon: '🪐' },
    { minLevels: 70, title: 'Interplanetary Fleet Commander', icon: '👑' }
  ],

  init() {
    this.load();
    if (window.HealthSystem) {
      window.HealthSystem.setDifficulty(this.state.difficulty);
    }
  },

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.state = Object.assign(this.state, parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved progress:', e.message);
    }
    this.checkCertificateStatus();
  },

  save() {
    try {
      this.checkCertificateStatus();
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save game progress:', e.message);
    }
    this.updateHud();
  },

  resetProgress() {
    this.state = {
      astronautName: 'Alex',
      suitColor: 'orange',
      difficulty: 'scientist',
      stars: 0,
      sciencePoints: 0,
      currentGlobalLevel: 1,
      unlockedLevels: [1],
      badges: [],
      levelStars: {},
      certificateUnlocked: false,
      certificateId: null
    };
    this.save();
  },

  getCompletedLevelsCount() {
    return Object.keys(this.state.levelStars).filter(k => this.state.levelStars[k] > 0).length;
  },

  getCurrentRank() {
    const completed = this.getCompletedLevelsCount();
    let current = this.ranks[0];
    for (const r of this.ranks) {
      if (completed >= r.minLevels) {
        current = r;
      }
    }
    return current;
  },

  checkCertificateStatus() {
    const completed = this.getCompletedLevelsCount();
    if (completed >= 70) {
      this.state.certificateUnlocked = true;
      if (!this.state.certificateId) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        this.state.certificateId = `NASA-JAMT-2026-${rand}`;
      }
    } else {
      this.state.certificateUnlocked = false;
    }
  },

  addPoints(points, reason = '') {
    this.state.sciencePoints += points;
    this.save();
    if (window.AudioManager) window.AudioManager.playChime();
    this.showFloatingNotice(`+${points} Science Points! ${reason}`);
  },

  addStars(starsCount, globalLevelNumber) {
    const prev = this.state.levelStars[globalLevelNumber] || 0;
    if (starsCount > prev) {
      this.state.stars += (starsCount - prev);
      this.state.levelStars[globalLevelNumber] = starsCount;
    }
    this.save();
  },

  unlockNextLevel(completedGlobalLevel) {
    const nextLvl = completedGlobalLevel + 1;
    if (nextLvl <= 70 && !this.state.unlockedLevels.includes(nextLvl)) {
      this.state.unlockedLevels.push(nextLvl);
    }
    this.save();
  },

  isLevelUnlocked(globalLevelNumber) {
    return this.state.unlockedLevels.includes(globalLevelNumber);
  },

  awardBadge(badgeId, missionData) {
    if (!this.state.badges.includes(badgeId)) {
      this.state.badges.push(badgeId);
      this.save();

      const modal = document.getElementById('badge-celebration-modal');
      if (modal) {
        const titleEl = document.getElementById('badge-title-display');
        const descEl = document.getElementById('badge-desc-display');
        const iconEl = document.getElementById('badge-icon-display');

        if (titleEl) titleEl.textContent = missionData.badgeTitle || 'Mission Badge';
        if (descEl) descEl.textContent = missionData.badgeDesc || 'Mission completed!';
        if (iconEl) iconEl.textContent = missionData.icon || '🎖️';

        modal.classList.remove('hidden');
      }

      this.triggerConfetti();
      if (window.AudioManager) window.AudioManager.playCelebration();
    }
  },

  showFloatingNotice(text) {
    const container = document.body;
    const notice = document.createElement('div');
    notice.className = 'floating-notice-banner';
    notice.textContent = text;
    container.appendChild(notice);

    setTimeout(() => {
      notice.classList.add('fade-out');
      setTimeout(() => notice.remove(), 600);
    }, 2800);
  },

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00E5FF', '#FFD700', '#FF4081', '#00E676', '#FF9100', '#FFFFFF'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 120) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    anim();
  },

  updateHud() {
    const elName = document.getElementById('hud-player-name');
    const elStars = document.getElementById('hud-stars-count');
    const elPoints = document.getElementById('hud-science-points');
    const elSuit = document.getElementById('hud-avatar-icon');
    const elRank = document.getElementById('hud-player-rank');

    if (elName) elName.textContent = this.state.astronautName || 'Cadet';
    if (elStars) elStars.textContent = this.state.stars || 0;
    if (elPoints) elPoints.textContent = this.state.sciencePoints || 0;
    if (elRank) {
      const rank = this.getCurrentRank();
      elRank.textContent = `${rank.icon} ${rank.title}`;
    }
    if (elSuit) {
      elSuit.textContent = this.state.cadetAvatar || '🧑‍🚀';
    }
  }
};

window.RewardsManager = RewardsManager;
