/**
 * Master Game Engine & Screen State Controller
 * Handles screens: Home, Character Select, Mission Control (7 Missions & 70 Levels),
 * Active Gameplay, Settings, NASA Science Lab, and Graduation Certificate.
 */

const GuideManager = {
  currentText: '',
  timer: null,

  speak(text, emotion = 'happy') {
    this.currentText = text;
    const bubble = document.getElementById('guide-speech-bubble');
    const avatar = document.getElementById('guide-avatar');
    const textEl = document.getElementById('guide-speech-text');

    if (textEl) textEl.textContent = text;
    if (bubble) bubble.classList.remove('hidden');

    const emotions = {
      happy: '🧑‍🚀',
      excited: '🤩',
      alert: '⚠️',
      surprised: '😮'
    };
    if (avatar) avatar.textContent = emotions[emotion] || '🧑‍🚀';

    if (window.AudioManager && typeof window.AudioManager.playGuideSpeech === 'function') {
      window.AudioManager.playGuideSpeech();
    }

    try {
      if ('speechSynthesis' in window && !window.AudioManager?.isMuted) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 1.22;
        utter.rate = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
        if (engVoice) utter.voice = engVoice;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (bubble) bubble.classList.add('hidden');
    }, 6500);
  },

  dismiss() {
    const bubble = document.getElementById('guide-speech-bubble');
    if (bubble) bubble.classList.add('hidden');
    if (this.timer) clearTimeout(this.timer);
  }
};

window.GuideManager = GuideManager;

/* =========================================================================
   UNIVERSAL NAVIGATION MANAGER & SMART HISTORY ARCHITECTURE
   ========================================================================= */

const NavigationManager = {
  screenHistory: ['home'],
  modalHistory: [],
  isNavigating: false,
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    if (typeof window !== 'undefined') {
      const hash = window.location && window.location.hash ? window.location.hash.replace('#', '') : '';
      if (hash && ['home', 'select', 'levels', 'how-to-play'].includes(hash)) {
        if (hash === 'levels') {
          this.screenHistory = ['home', 'select', 'levels'];
        } else if (hash === 'select') {
          this.screenHistory = ['home', 'select'];
        } else if (hash === 'how-to-play') {
          this.screenHistory = ['home', 'how-to-play'];
        }
      }

      try {
        if (window.history && window.history.replaceState) {
          const current = this.currentScreen();
          window.history.replaceState({ screen: current }, '', '#' + current);
        }
      } catch (e) {}

      window.addEventListener('popstate', (e) => this.handlePopState(e));
      window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    this.bindButtons();
  },

  currentScreen() {
    return this.screenHistory[this.screenHistory.length - 1] || 'home';
  },

  recordScreen(screenId, pushBrowser = true) {
    if (!screenId) return;
    const current = this.currentScreen();
    if (current !== screenId) {
      this.screenHistory.push(screenId);
      this.deduplicateHistory();
      if (pushBrowser && typeof window !== 'undefined' && window.history?.pushState) {
        try {
          window.history.pushState({ screen: screenId }, '', '#' + screenId);
        } catch (e) {}
      }
    }
  },

  deduplicateHistory() {
    const cleaned = [];
    for (let i = 0; i < this.screenHistory.length; i++) {
      if (cleaned.length === 0 || cleaned[cleaned.length - 1] !== this.screenHistory[i]) {
        cleaned.push(this.screenHistory[i]);
      }
    }
    this.screenHistory = cleaned.length > 0 ? cleaned : ['home'];
  },

  navigateTo(screenId) {
    if (this.isNavigating) return;
    this.isNavigating = true;
    try {
      this.closeAllModals();
      this.recordScreen(screenId, true);
      GameEngine.showScreen(screenId, false);
    } finally {
      this.isNavigating = false;
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (!this.modalHistory.some(m => m.modalId === modalId)) {
      this.modalHistory.push({
        modalId,
        callerScreen: GameEngine.currentScreen || this.currentScreen()
      });
    }

    modal.classList.remove('hidden');

    try {
      if (typeof window !== 'undefined' && window.history?.pushState) {
        window.history.pushState({ modal: modalId, screen: this.currentScreen() }, '', '#' + modalId);
      }
    } catch (e) {}
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    this.modalHistory = this.modalHistory.filter(m => m.modalId !== modalId);
  },

  closeAllModals() {
    const modalIds = [
      'leave-mission-confirm-modal',
      'story-intro-modal',
      'nasa-telemetry-modal',
      'settings-modal',
      'certificate-modal',
      'pause-modal',
      'badge-celebration-modal'
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    this.modalHistory = [];
    if (window.StoryEngine) window.StoryEngine.stopNarration?.();
    if (GameEngine) GameEngine.isPaused = false;
  },

  goBack(updateBrowser = true) {
    if (this.isNavigating) return;
    this.isNavigating = true;

    try {
      // 1. If leave-mission confirmation modal is open, dismiss it
      const leaveModal = document.getElementById('leave-mission-confirm-modal');
      if (leaveModal && !leaveModal.classList.contains('hidden')) {
        this.cancelLeaveMission();
        return;
      }

      // 2. If story-intro-modal is open, cancel and return to levels
      const storyModal = document.getElementById('story-intro-modal');
      if (storyModal && !storyModal.classList.contains('hidden')) {
        if (window.StoryEngine?.cancelStory) {
          window.StoryEngine.cancelStory();
        } else {
          storyModal.classList.add('hidden');
        }
        return;
      }

      // 3. If any other modal is open, close it
      const modalCheckList = [
        'nasa-telemetry-modal',
        'settings-modal',
        'certificate-modal',
        'pause-modal',
        'badge-celebration-modal'
      ];

      for (const mId of modalCheckList) {
        const mEl = document.getElementById(mId);
        if (mEl && !mEl.classList.contains('hidden')) {
          mEl.classList.add('hidden');
          if (mId === 'pause-modal') GameEngine.isPaused = false;
          this.modalHistory = this.modalHistory.filter(m => m.modalId !== mId);
          return;
        }
      }

      // 4. Gameplay Protection when on screen 'play'
      const activeScreen = GameEngine.currentScreen || this.currentScreen();
      if (activeScreen === 'play') {
        const isActivelyPlaying = window.MissionsManager &&
          (window.MissionsManager.gameState === 'PLAYING' || window.MissionsManager.activeEngine);

        if (isActivelyPlaying) {
          this.promptLeaveMission();
          return;
        } else {
          // Finished level or game over, return to levels
          this.confirmLeaveMission();
          return;
        }
      }

      // 5. Normal Screen History Navigation
      if (this.screenHistory.length > 1) {
        this.screenHistory.pop(); // remove current screen
        const prevScreen = this.screenHistory[this.screenHistory.length - 1] || 'home';
        GameEngine.showScreen(prevScreen, false);

        if (updateBrowser && typeof window !== 'undefined' && window.history?.replaceState) {
          try {
            window.history.replaceState({ screen: prevScreen }, '', '#' + prevScreen);
          } catch (e) {}
        }
      } else {
        GameEngine.showScreen('home', false);
      }
    } finally {
      this.isNavigating = false;
    }
  },

  promptLeaveMission() {
    const leaveModal = document.getElementById('leave-mission-confirm-modal');
    if (leaveModal) {
      leaveModal.classList.remove('hidden');
    } else {
      if (confirm('Leave current mission level? Your saved progress is preserved.')) {
        this.confirmLeaveMission();
      }
    }
  },

  cancelLeaveMission() {
    const leaveModal = document.getElementById('leave-mission-confirm-modal');
    if (leaveModal) leaveModal.classList.add('hidden');
  },

  confirmLeaveMission() {
    const leaveModal = document.getElementById('leave-mission-confirm-modal');
    if (leaveModal) leaveModal.classList.add('hidden');

    if (window.HealthSystem) window.HealthSystem.stopSimulation();
    if (window.MissionsManager?.activeEngine?.cleanup) {
      window.MissionsManager.activeEngine.cleanup();
    }
    if (window.MissionsManager) {
      window.MissionsManager.gameState = 'IDLE';
    }

    if (this.screenHistory.length > 1) {
      this.screenHistory.pop();
      const prevScreen = this.screenHistory[this.screenHistory.length - 1] || 'levels';
      GameEngine.showScreen(prevScreen, false);
    } else {
      GameEngine.showScreen('levels', false);
    }

    try {
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({ screen: 'levels' }, '', '#levels');
      }
    } catch (e) {}
  },

  handlePopState(event) {
    const leaveModal = document.getElementById('leave-mission-confirm-modal');
    if (leaveModal && !leaveModal.classList.contains('hidden')) {
      this.cancelLeaveMission();
      return;
    }

    const openModals = [
      'story-intro-modal',
      'nasa-telemetry-modal',
      'settings-modal',
      'certificate-modal',
      'pause-modal',
      'badge-celebration-modal'
    ];
    for (const mId of openModals) {
      const el = document.getElementById(mId);
      if (el && !el.classList.contains('hidden')) {
        this.closeModal(mId);
        if (mId === 'story-intro-modal' && window.StoryEngine?.cancelStory) {
          window.StoryEngine.cancelStory();
        }
        return;
      }
    }

    const activeScreen = GameEngine.currentScreen || this.currentScreen();
    if (activeScreen === 'play') {
      const isActivelyPlaying = window.MissionsManager &&
        (window.MissionsManager.gameState === 'PLAYING' || window.MissionsManager.activeEngine);

      if (isActivelyPlaying) {
        try {
          if (window.history?.pushState) {
            window.history.pushState({ screen: 'play' }, '', '#play');
          }
        } catch (e) {}
        this.promptLeaveMission();
        return;
      }
    }

    const targetScreen = event.state?.screen || (window.location.hash ? window.location.hash.replace('#', '') : 'home');
    if (targetScreen && ['home', 'select', 'levels', 'how-to-play', 'play'].includes(targetScreen)) {
      if (this.screenHistory.length > 1 && this.screenHistory[this.screenHistory.length - 2] === targetScreen) {
        this.screenHistory.pop();
      } else if (this.currentScreen() !== targetScreen) {
        this.screenHistory.push(targetScreen);
        this.deduplicateHistory();
      }
      GameEngine.showScreen(targetScreen, false);
    } else {
      this.goBack(false);
    }
  },

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      const leaveModal = document.getElementById('leave-mission-confirm-modal');
      if (leaveModal && !leaveModal.classList.contains('hidden')) {
        event.preventDefault();
        this.cancelLeaveMission();
        return;
      }

      const storyModal = document.getElementById('story-intro-modal');
      if (storyModal && !storyModal.classList.contains('hidden')) {
        event.preventDefault();
        this.goBack();
        return;
      }

      const openModals = [
        'nasa-telemetry-modal',
        'settings-modal',
        'certificate-modal',
        'badge-celebration-modal'
      ];
      for (const mId of openModals) {
        const el = document.getElementById(mId);
        if (el && !el.classList.contains('hidden')) {
          event.preventDefault();
          this.closeModal(mId);
          return;
        }
      }

      const current = GameEngine.currentScreen || this.currentScreen();
      if (['select', 'how-to-play', 'levels'].includes(current)) {
        event.preventDefault();
        this.goBack();
        return;
      }
    }
  },

  bindButtons() {
    const backBtnIds = [
      'btn-select-back',
      'btn-levels-back',
      'btn-how-top-back',
      'btn-how-back',
      'hud-back-btn',
      'btn-story-back',
      'btn-telemetry-top-back',
      'btn-telemetry-close',
      'btn-settings-top-back',
      'btn-settings-close',
      'btn-cert-top-back',
      'btn-cert-close',
      'btn-pause-top-back',
      'btn-badge-top-back',
      'btn-leave-top-back'
    ];

    backBtnIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn && !btn._navBound) {
        btn._navBound = true;
        btn.addEventListener('click', (e) => {
          if (e && e.preventDefault) e.preventDefault();
          if (window.AudioManager) window.AudioManager.playClick();
          this.goBack();
        });
      }
    });

    const btnLeaveCancel = document.getElementById('btn-leave-cancel');
    if (btnLeaveCancel && !btnLeaveCancel._navBound) {
      btnLeaveCancel._navBound = true;
      btnLeaveCancel.addEventListener('click', (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (window.AudioManager) window.AudioManager.playClick();
        this.cancelLeaveMission();
      });
    }

    const btnLeaveConfirm = document.getElementById('btn-leave-confirm');
    if (btnLeaveConfirm && !btnLeaveConfirm._navBound) {
      btnLeaveConfirm._navBound = true;
      btnLeaveConfirm.addEventListener('click', (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (window.AudioManager) window.AudioManager.playClick();
        this.confirmLeaveMission();
      });
    }
  }
};

window.NavigationManager = NavigationManager;

const GameEngine = {
  currentScreen: 'home',
  isPaused: false,
  selectedMissionFilter: null,

  init() {
    console.log('🚀 SPACE WARS Initializing 70-Level Adventure...');
    this.navigation = NavigationManager;
    this.bindScreenButtons();
    this.bindSuitSelection();
    this.bindSurvivalTray();
    this.bindModals();
    this.initCanvasResize();

    // Start on Home Screen & initialize navigation manager
    NavigationManager.init();
    this.showScreen('home');

    if (window.RewardsManager) {
      window.RewardsManager.init();
      window.RewardsManager.updateHud();
    }

    if (window.NasaDataManager) {
      window.NasaDataManager.initialize();
    }
  },

  showScreen(screenId, recordHistory = true) {
    if (recordHistory && window.NavigationManager) {
      window.NavigationManager.recordScreen(screenId, true);
    }
    this.currentScreen = screenId;
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(s => s.classList.add('hidden'));

    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
      target.classList.remove('hidden');
    }

    const hud = document.getElementById('game-hud');
    const touchBar = document.getElementById('mobile-controls-bar');
    const guideWidget = document.getElementById('guide-character-widget');

    if (screenId === 'play') {
      document.body.classList.add('in-game');
      if (hud) hud.classList.remove('hidden');
      if (touchBar) touchBar.classList.remove('hidden');
      if (guideWidget) guideWidget.classList.remove('hidden');
    } else {
      document.body.classList.remove('in-game');
      if (hud) hud.classList.add('hidden');
      if (touchBar) touchBar.classList.add('hidden');
      if (['select', 'levels'].includes(screenId)) {
        if (guideWidget) guideWidget.classList.remove('hidden');
      } else {
        if (guideWidget) guideWidget.classList.add('hidden');
      }
    }

    if (screenId === 'levels') {
      this.refreshMissionsList();
      if (window.GuideManager) {
        window.GuideManager.speak("Choose your next space mission from Mission Control!", "happy");
      }
    }

    if (screenId === 'select') {
      if (window.GuideManager) {
        window.GuideManager.speak("Pick your spacesuit and mission difficulty!", "excited");
      }
    }
  },

  bindScreenButtons() {
    // Home Screen buttons
    const btnPlayNow = document.getElementById('btn-home-play');
    if (btnPlayNow) {
      btnPlayNow.addEventListener('click', () => {
        if (window.AudioManager) {
          window.AudioManager.playClick();
          window.AudioManager.startSpaceMusic();
        }
        this.showScreen('select');
      });
    }

    const btnHowToPlay = document.getElementById('btn-home-how');
    if (btnHowToPlay) {
      btnHowToPlay.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.showScreen('how-to-play');
      });
    }

    const btnScienceLab = document.getElementById('btn-home-sci-lab');
    if (btnScienceLab) {
      btnScienceLab.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.openScienceLabModal();
      });
    }

    const btnSettings = document.getElementById('btn-home-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.openSettingsModal();
      });
    }

    const btnStartMission = document.getElementById('btn-start-mission');
    if (btnStartMission) {
      btnStartMission.addEventListener('click', () => {
        const inputName = document.getElementById('player-name-input');
        if (inputName && inputName.value.trim()) {
          window.RewardsManager.state.astronautName = inputName.value.trim();
        }
        window.RewardsManager.save();
        if (window.AudioManager) window.AudioManager.playClick();
        this.showScreen('levels');
      });
    }

    // HUD buttons
    const btnHudPause = document.getElementById('hud-pause-btn');
    if (btnHudPause) {
      btnHudPause.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.togglePause();
      });
    }

    const btnHudSound = document.getElementById('hud-sound-toggle');
    if (btnHudSound) {
      btnHudSound.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.toggleSound();
      });
    }

    const btnHudMissions = document.getElementById('hud-missions-btn');
    if (btnHudMissions) {
      btnHudMissions.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        if (window.NavigationManager) {
          window.NavigationManager.goBack();
        } else {
          if (window.HealthSystem) window.HealthSystem.stopSimulation();
          if (window.MissionsManager?.activeEngine?.cleanup) {
            window.MissionsManager.activeEngine.cleanup();
          }
          this.showScreen('levels');
        }
      });
    }

    const nasaPill = document.getElementById('hud-nasa-telemetry-pill');
    if (nasaPill) {
      nasaPill.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.openScienceLabModal();
      });
    }

    const btnViewCert = document.getElementById('btn-view-certificate');
    if (btnViewCert) {
      btnViewCert.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.openCertificateModal();
      });
    }
  },

  bindSuitSelection() {
    // Cadet Character selection
    const cadetBtns = document.querySelectorAll('.cadet-card-btn');
    cadetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        cadetBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const cadetId = btn.getAttribute('data-cadet-id') || 'leo';
        const cadetName = btn.getAttribute('data-cadet-name') || 'Leo';
        const cadetAvatar = btn.getAttribute('data-cadet-avatar') || '🧑‍🚀';
        const cadetRole = btn.getAttribute('data-cadet-role') || 'Rocket Flight Pilot';

        if (window.RewardsManager) {
          window.RewardsManager.state.cadetId = cadetId;
          window.RewardsManager.state.cadetAvatar = cadetAvatar;
          window.RewardsManager.state.cadetRole = cadetRole;
          window.RewardsManager.state.astronautName = cadetName;
          window.RewardsManager.save();
        }

        const nameInput = document.getElementById('player-name-input');
        if (nameInput) nameInput.value = cadetName;

        const previewName = document.getElementById('preview-astronaut-name');
        if (previewName) previewName.textContent = `Cadet ${cadetName}`;

        const previewRole = document.querySelector('.preview-role');
        if (previewRole) previewRole.textContent = `${cadetRole} • Moon & Mars Program`;

        const hudAvatar = document.getElementById('hud-avatar-icon');
        if (hudAvatar) hudAvatar.textContent = cadetAvatar;

        const hudName = document.getElementById('hud-player-name');
        if (hudName) hudName.textContent = cadetName;

        this.updateAvatarPreview();
        if (window.AudioManager) window.AudioManager.playClick();
      });
    });

    const suitBtns = document.querySelectorAll('.suit-color-option');
    suitBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        suitBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const color = btn.getAttribute('data-suit-color') || 'orange';
        window.RewardsManager.state.suitColor = color;
        window.RewardsManager.save();
        this.updateAvatarPreview(color);
        if (window.AudioManager) window.AudioManager.playClick();
      });
    });

    // Difficulty buttons
    const diffBtns = document.querySelectorAll('.diff-option-btn');
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const diff = btn.getAttribute('data-difficulty') || 'scientist';
        window.RewardsManager.state.difficulty = diff;
        if (window.HealthSystem) window.HealthSystem.setDifficulty(diff);
        window.RewardsManager.save();
        if (window.AudioManager) window.AudioManager.playClick();
      });
    });

    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
      nameInput.value = window.RewardsManager?.state?.astronautName || 'Alex';
      nameInput.addEventListener('input', (e) => {
        const previewName = document.getElementById('preview-astronaut-name');
        if (previewName) previewName.textContent = `Cadet ${e.target.value.trim() || 'Cadet'}`;
        const hudName = document.getElementById('hud-player-name');
        if (hudName) hudName.textContent = e.target.value.trim() || 'Cadet';
      });
    }
  },

  updateAvatarPreview(color = null) {
    const preview = document.getElementById('character-preview-avatar');
    if (!preview) return;
    const suitColor = color || window.RewardsManager?.state?.suitColor || 'orange';
    const avatar = window.RewardsManager?.state?.cadetAvatar || '🧑‍🚀';
    const suitDots = {
      orange: '🟠',
      blue: '🔵',
      pink: '🌸',
      green: '🟢',
      white: '⚪'
    };
    const dot = suitDots[suitColor] || '🟠';
    preview.textContent = `${dot} ${avatar}`;
  },

  bindSurvivalTray() {
    const tray = document.getElementById('hud-survival-action-tray');
    if (!tray) return;

    tray.querySelectorAll('.survival-act-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.getAttribute('data-action');
        if (actionId && window.HealthSystem) {
          window.HealthSystem.performSurvivalAction(actionId);
        }
      });
    });
  },

  refreshMissionsList() {
    const container = document.getElementById('levels-grid-container');
    if (!container || !window.MISSIONS_DATA) return;
    container.innerHTML = '';

    const completedTotal = window.RewardsManager?.getCompletedLevelsCount() || 0;
    const rank = window.RewardsManager?.getCurrentRank();

    // Summary banner at top
    const banner = document.createElement('div');
    banner.className = 'missions-overview-banner';
    banner.innerHTML = `
      <div class="ov-item"><strong>${completedTotal} / 70</strong> Levels Completed</div>
      <div class="ov-item">⭐ <strong>${window.RewardsManager?.state?.stars || 0}</strong> Stars</div>
      <div class="ov-item">🎖️ <strong>${window.RewardsManager?.state?.badges?.length || 0} / 7</strong> Badges</div>
      <div class="ov-item">${rank.icon} Rank: <strong>${rank.title}</strong></div>
    `;
    container.appendChild(banner);

    // List all 7 major missions with expandable accordion
    window.MISSIONS_DATA.forEach((mission) => {
      const missionCard = document.createElement('div');
      missionCard.className = 'mission-accordion-card';

      const completedInMission = mission.levels.filter(l => (window.RewardsManager.state.levelStars[l.globalLevel] || 0) > 0).length;
      const isMissionUnlocked = mission.levels.some(l => window.RewardsManager.isLevelUnlocked(l.globalLevel));
      const hasBadge = window.RewardsManager.state.badges.includes(mission.badgeId);

      missionCard.innerHTML = `
        <div class="mission-acc-header">
          <div class="acc-left">
            <span class="mission-num-badge">${mission.id}</span>
            <span class="mission-icon">${mission.icon}</span>
            <div class="mission-title-group">
              <div class="mission-name">${mission.name}</div>
              <div class="mission-sub">${mission.nasaRef}</div>
            </div>
          </div>
          <div class="acc-right">
            <span class="mission-progress-tag">${completedInMission} / 10 Levels</span>
            ${hasBadge ? `<span class="mission-badge-icon" title="${mission.badgeTitle}">🎖️</span>` : ''}
            <button class="btn-expand-mission">${isMissionUnlocked ? 'EXPAND ▾' : '🔒 LOCKED'}</button>
          </div>
        </div>
        <div class="mission-levels-drawer ${this.selectedMissionFilter === mission.id ? 'open' : 'hidden'}">
          <div class="sub-levels-grid"></div>
        </div>
      `;

      const header = missionCard.querySelector('.mission-acc-header');
      const drawer = missionCard.querySelector('.mission-levels-drawer');
      const subGrid = missionCard.querySelector('.sub-levels-grid');

      header.addEventListener('click', () => {
        if (!isMissionUnlocked) {
          if (window.RewardsManager) window.RewardsManager.showFloatingNotice('Complete previous missions to unlock this phase!');
          return;
        }
        const isOpen = !drawer.classList.contains('hidden');
        document.querySelectorAll('.mission-levels-drawer').forEach(d => d.classList.add('hidden'));
        if (!isOpen) {
          drawer.classList.remove('hidden');
          this.selectedMissionFilter = mission.id;
        } else {
          this.selectedMissionFilter = null;
        }
        if (window.AudioManager) window.AudioManager.playClick();
      });

      // Populate 10 levels for this mission
      mission.levels.forEach((lvl) => {
        const isLvlUnlocked = window.RewardsManager.isLevelUnlocked(lvl.globalLevel);
        const stars = window.RewardsManager.state.levelStars[lvl.globalLevel] || 0;

        const lvlBtn = document.createElement('div');
        lvlBtn.className = `level-pill-card ${isLvlUnlocked ? 'unlocked' : 'locked'}`;
        lvlBtn.innerHTML = `
          <div class="pill-top">
            <span class="pill-num">L${lvl.levelInMission} (Total #${lvl.globalLevel})</span>
            <span class="pill-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
          </div>
          <div class="pill-title">${lvl.title}</div>
          <div class="pill-arch">Type: ${lvl.archetype.toUpperCase()}</div>
          <button class="pill-launch-btn">${isLvlUnlocked ? 'LAUNCH 🚀' : '🔒'}</button>
        `;

        if (isLvlUnlocked) {
          lvlBtn.onclick = (e) => {
            e.stopPropagation();
            if (window.AudioManager) window.AudioManager.playClick();
            this.showScreen('play');
            window.MissionsManager.startLevel(lvl.globalLevel);
          };
        }

        subGrid.appendChild(lvlBtn);
      });

      container.appendChild(missionCard);
    });
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    const modal = document.getElementById('pause-modal');
    if (!modal) return;
    if (this.isPaused) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  },

  bindModals() {
    const btnResume = document.getElementById('btn-pause-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.togglePause();
      });
    }

    const btnPauseRestart = document.getElementById('btn-pause-restart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.togglePause();
        window.MissionsManager.startLevel(window.MissionsManager.currentGlobalLevel);
      });
    }

    const btnPauseExit = document.getElementById('btn-pause-exit');
    if (btnPauseExit) {
      btnPauseExit.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.togglePause();
        if (window.HealthSystem) window.HealthSystem.stopSimulation();
        if (window.MissionsManager?.activeEngine?.cleanup) {
          window.MissionsManager.activeEngine.cleanup();
        }
        this.showScreen('levels');
      });
    }

    const btnNextLevel = document.getElementById('btn-complete-next');
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        if (window.MissionsManager && window.MissionsManager.currentGlobalLevel >= 70) {
          const modal = document.getElementById('level-complete-modal');
          if (modal) modal.classList.add('hidden');
          this.openCertificateModal();
          return;
        }
        if (window.MissionsManager?.loadNextLevel) {
          window.MissionsManager.loadNextLevel();
        } else {
          const modal = document.getElementById('level-complete-modal');
          if (modal) modal.classList.add('hidden');
          const nextLvl = window.MissionsManager.currentGlobalLevel + 1;
          if (nextLvl <= 70) {
            window.MissionsManager.startLevel(nextLvl);
          } else {
            this.openCertificateModal();
          }
        }
      });
    }

    const btnCompleteRetry = document.getElementById('btn-complete-retry');
    if (btnCompleteRetry) {
      btnCompleteRetry.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        const modal = document.getElementById('level-complete-modal');
        if (modal) modal.classList.add('hidden');
        if (window.MissionsManager?.restartCurrentLevel) {
          window.MissionsManager.restartCurrentLevel();
        }
      });
    }

    const btnFailedRetry = document.getElementById('btn-failed-retry');
    if (btnFailedRetry) {
      btnFailedRetry.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        if (window.MissionsManager?.restartCurrentLevel) {
          window.MissionsManager.restartCurrentLevel();
        } else {
          const modal = document.getElementById('mission-failed-modal');
          if (modal) modal.classList.add('hidden');
          window.MissionsManager.startLevel(window.MissionsManager.currentGlobalLevel);
        }
      });
    }

    const btnFailedExit = document.getElementById('btn-failed-exit');
    if (btnFailedExit) {
      btnFailedExit.addEventListener('click', () => {
        const modal = document.getElementById('mission-failed-modal');
        if (modal) modal.classList.add('hidden');
        if (window.AudioManager) window.AudioManager.playClick();
        if (window.HealthSystem) window.HealthSystem.stopSimulation();
        if (window.MissionsManager?.activeEngine?.cleanup) {
          window.MissionsManager.activeEngine.cleanup();
        }
        this.showScreen('levels');
      });
    }

    const btnFailedInfo = document.getElementById('btn-failed-info');
    if (btnFailedInfo) {
      btnFailedInfo.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        const infoBox = document.getElementById('failed-mission-info-box');
        if (infoBox) {
          infoBox.classList.toggle('hidden');
        }
      });
    }

    const btnBadgeClose = document.getElementById('btn-badge-close');
    if (btnBadgeClose) {
      btnBadgeClose.addEventListener('click', () => {
        const modal = document.getElementById('badge-celebration-modal');
        if (modal) modal.classList.add('hidden');
        if (window.AudioManager) window.AudioManager.playClick();
      });
    }

    const btnPrintCert = document.getElementById('btn-print-certificate');
    if (btnPrintCert) {
      btnPrintCert.addEventListener('click', () => {
        window.print();
      });
    }
  },

  openSettingsModal() {
    if (window.NavigationManager) {
      window.NavigationManager.openModal('settings-modal');
    } else {
      const modal = document.getElementById('settings-modal');
      if (modal) modal.classList.remove('hidden');
    }
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const soundBtn = document.getElementById('settings-sound-btn');
    if (soundBtn) {
      soundBtn.onclick = () => {
        window.AudioManager.toggleSound();
      };
    }

    const resetBtn = document.getElementById('settings-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Reset all 70 levels of astronaut training progress?')) {
          window.RewardsManager.resetProgress();
          this.refreshMissionsList();
          modal.classList.add('hidden');
        }
      };
    }
  },

  openScienceLabModal() {
    if (window.NavigationManager) {
      window.NavigationManager.openModal('nasa-telemetry-modal');
    } else {
      const modal = document.getElementById('nasa-telemetry-modal');
      if (modal) modal.classList.remove('hidden');
    }
    const modal = document.getElementById('nasa-telemetry-modal');
    if (!modal) return;

    const report = window.NasaDataManager?.getTelemetryReport();
    const container = document.getElementById('telemetry-details-container');
    if (!container || !report) return;

    container.innerHTML = `
      <div class="telemetry-banner status-${report.aggregateStatus.toLowerCase().replace(/\s+/g, '-')}">
        AGGREGATE NASA DATA STATUS: <strong>${report.aggregateStatus}</strong>
        <div class="telemetry-time">System Time: ${new Date(report.timestamp).toLocaleTimeString()}</div>
      </div>
      <div class="telemetry-cards-grid">
        ${Object.values(report.services).map(s => `
          <div class="telemetry-card">
            <div class="tel-card-title">${s.name}</div>
            <div class="tel-card-status status-${s.status.toLowerCase().replace(/\s+/g, '-')}">${s.status}</div>
            <div class="tel-card-endpoint"><code>${s.apiEndpoint || s.source}</code></div>
            <div class="tel-card-summary">${s.summary}</div>
            <div class="tel-card-gameplay"><strong>Gameplay Role:</strong> ${s.gameplayImpact}</div>
            <div class="tel-card-time">Updated: ${s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString() : 'Active'}</div>
            <a href="${s.source}" target="_blank" rel="noopener" class="tel-card-link">Official NASA Portal ↗</a>
          </div>
        `).join('')}
      </div>
    `;
  },

  openCertificateModal() {
    if (window.NavigationManager) {
      window.NavigationManager.openModal('certificate-modal');
    } else {
      const modal = document.getElementById('certificate-modal');
      if (modal) modal.classList.remove('hidden');
    }
    const modal = document.getElementById('certificate-modal');
    if (!modal) return;

    const completed = window.RewardsManager?.getCompletedLevelsCount() || 0;
    const isUnlocked = completed >= 70;

    const certUnlockedView = document.getElementById('cert-unlocked-view');
    const certLockedView = document.getElementById('cert-locked-view');

    if (!isUnlocked) {
      if (certUnlockedView) certUnlockedView.classList.add('hidden');
      if (certLockedView) {
        certLockedView.classList.remove('hidden');
        document.getElementById('cert-progress-meter').textContent = `${completed} / 70 Levels Completed`;
      }
      return;
    }

    if (certLockedView) certLockedView.classList.add('hidden');
    if (certUnlockedView) certUnlockedView.classList.remove('hidden');

    document.getElementById('cert-player-name').textContent = window.RewardsManager?.state?.astronautName || 'SPACE WARS Commander';
    document.getElementById('cert-total-stars').textContent = `${window.RewardsManager?.state?.stars || 0} / 210 Stars`;
    document.getElementById('cert-total-points').textContent = `${window.RewardsManager?.state?.sciencePoints || 0} Science Points`;
    document.getElementById('cert-id-number').textContent = `ID: ${window.RewardsManager?.state?.certificateId || 'NASA-SPACE-WARS-000001'}`;
    document.getElementById('cert-date').textContent = new Date().toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    if (window.RewardsManager) {
      window.RewardsManager.triggerConfetti();
    }
  },

  initCanvasResize() {
    window.addEventListener('resize', () => {
      if (this.currentScreen === 'play' && window.MissionsManager?.activeEngine?.resize) {
        window.MissionsManager.activeEngine.resize();
      }
    });
  }
};

window.GameEngine = GameEngine;
