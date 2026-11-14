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

const GameEngine = {
  currentScreen: 'home',
  isPaused: false,
  selectedMissionFilter: null,

  init() {
    console.log('🚀 Junior Astronaut Mission Trainer Initializing 70-Level Adventure...');
    this.bindScreenButtons();
    this.bindSuitSelection();
    this.bindSurvivalTray();
    this.bindModals();
    this.initCanvasResize();

    // Start on Home Screen
    this.showScreen('home');

    if (window.RewardsManager) {
      window.RewardsManager.init();
      window.RewardsManager.updateHud();
    }

    if (window.NasaDataManager) {
      window.NasaDataManager.initialize();
    }
  },

  showScreen(screenId) {
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

    const btnHowBack = document.getElementById('btn-how-back');
    if (btnHowBack) {
      btnHowBack.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playClick();
        this.showScreen('home');
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
        if (window.HealthSystem) window.HealthSystem.stopSimulation();
        if (window.MissionsManager?.activeEngine?.cleanup) {
          window.MissionsManager.activeEngine.cleanup();
        }
        this.showScreen('levels');
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
      nameInput.value = window.RewardsManager.state.astronautName || 'Alex';
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

    const closeBtn = (id, modalId) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', () => {
          const m = document.getElementById(modalId);
          if (m) m.classList.add('hidden');
          if (window.AudioManager) window.AudioManager.playClick();
        });
      }
    };

    closeBtn('btn-telemetry-close', 'nasa-telemetry-modal');
    closeBtn('btn-settings-close', 'settings-modal');
    closeBtn('btn-cert-close', 'certificate-modal');

    const btnPrintCert = document.getElementById('btn-print-certificate');
    if (btnPrintCert) {
      btnPrintCert.addEventListener('click', () => {
        window.print();
      });
    }
  },

  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

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
    const modal = document.getElementById('nasa-telemetry-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

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
    const modal = document.getElementById('certificate-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

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

    document.getElementById('cert-player-name').textContent = window.RewardsManager?.state?.astronautName || 'Junior Explorer';
    document.getElementById('cert-total-stars').textContent = `${window.RewardsManager?.state?.stars || 0} / 210 Stars`;
    document.getElementById('cert-total-points').textContent = `${window.RewardsManager?.state?.sciencePoints || 0} Science Points`;
    document.getElementById('cert-id-number').textContent = `ID: ${window.RewardsManager?.state?.certificateId || 'NASA-JAMT-2026-000001'}`;
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
