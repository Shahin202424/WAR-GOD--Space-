/**
 * Frontend Mission Feedback & Scientific Debriefing
 * Translates tactical player decisions and success/failure states into immediate feedback
 * and authentic educational explanations.
 */

const MissionFeedback = {
  notify(message, type = 'info') {
    if (typeof window !== 'undefined' && window.RewardsManager?.showFloatingNotice) {
      window.RewardsManager.showFloatingNotice(message);
    }
  },

  explainOutcome(isSuccess, scenario, reason) {
    if (isSuccess) {
      return {
        title: 'Mission Accomplished! 🚀',
        explanation: scenario?.scientificExplanation || 'All planetary exploration protocols satisfied.',
        nasaSource: scenario?.source || 'NASA Open Science'
      };
    } else {
      return {
        title: 'Mission Aborted ⚠️',
        explanation: reason || 'Environmental thresholds exceeded. Review NASA safety guidelines and retry.',
        nasaSource: scenario?.source || 'NASA Open Science'
      };
    }
  }
};

if (typeof window !== 'undefined') {
  window.MissionFeedback = MissionFeedback;
}
if (typeof module !== 'undefined') {
  module.exports = MissionFeedback;
}

