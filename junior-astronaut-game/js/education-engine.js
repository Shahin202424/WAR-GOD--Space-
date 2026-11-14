/**
 * Educational Experience & Post-Level Science Fact Engine
 * 
 * STRICT RULE:
 * - NO multiple-choice questions
 * - NO quizzes or answer verification
 * - PURE GAMEPLAY & SCIENTIFIC BRIEFING ONLY
 */

const EducationEngine = {
  currentLevelData: null,
  onFinishCallback: null,

  showLearningCard(levelData, onFinish) {
    this.currentLevelData = levelData;
    this.onFinishCallback = onFinish;

    const modal = document.getElementById('education-learning-modal');
    if (!modal) {
      if (onFinish) onFinish();
      return;
    }

    // Ensure all legacy quiz blocks are permanently hidden
    const quizBlock = modal.querySelector('.edu-quiz-block');
    if (quizBlock) quizBlock.style.display = 'none';

    const card = levelData?.learningCard || {
      title: 'Mission Science Briefing',
      explanation: 'Astronauts rely on careful life support management to survive in extreme space environments.',
      spaceFact: 'NASA space biology and telemetry data help protect astronauts on the Moon and Mars.',
      datasetLink: 'NASA Open Science Data'
    };

    const elTitle = document.getElementById('edu-card-title');
    const elExplanation = document.getElementById('edu-explanation-text');
    const elFact = document.getElementById('edu-fact-text');
    const elNasaLink = document.getElementById('edu-nasa-source');
    const btnContinue = document.getElementById('btn-edu-continue');

    if (elTitle) elTitle.textContent = card.title || 'Mission Science Briefing';
    if (elExplanation) elExplanation.textContent = card.explanation || '';
    if (elFact) elFact.textContent = card.spaceFact || '';
    if (elNasaLink) elNasaLink.textContent = `🛰️ NASA Dataset Connection: ${card.datasetLink || 'NASA Science Data'}`;

    if (btnContinue) {
      btnContinue.onclick = () => {
        modal.classList.add('hidden');
        if (window.AudioManager && window.AudioManager.playClick) window.AudioManager.playClick();
        if (this.onFinishCallback) this.onFinishCallback();
      };
    }

    modal.classList.remove('hidden');
  }
};

window.EducationEngine = EducationEngine;
if (typeof module !== 'undefined') {
  module.exports = EducationEngine;
}
