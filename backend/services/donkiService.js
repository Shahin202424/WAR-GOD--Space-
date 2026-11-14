/**
 * NASA DONKI Space Weather Service
 * Official Source: https://ccmc.gsfc.nasa.gov/DONKI/
 * API Base: https://ccmc.gsfc.nasa.gov/DONKI/WS/get/ & https://api.nasa.gov/DONKI/
 */

const fs = require('fs');
const path = require('path');

const LOCAL_FALLBACK = path.join(__dirname, '..', '..', 'NASA_DATA_RESOURCES', '02_NASA_DONKI');

const DonkiService = {
  async getNotifications(startDate = null) {
    const start = startDate || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const ccmcUrl = `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/notifications?startDate=${encodeURIComponent(start)}&type=all`;

    try {
      const res = await fetch(ccmcUrl, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return {
            status: 'LIVE',
            source: 'NASA GSFC CCMC DONKI Web Service',
            events: data
          };
        }
      }
    } catch (e) {}

    // Fallback to verified local download
    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'donki_notifications.json'), 'utf8'));
      return {
        status: 'CACHED',
        source: 'NASA DONKI Space Weather Archive (May 2024 Historic Superstorm)',
        events: cached
      };
    } catch (e) {
      return { status: 'OFFLINE', events: [] };
    }
  },

  async getSolarFlares() {
    try {
      const res = await fetch('https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=2024-05-01&endDate=2024-05-15', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return { status: 'LIVE', flares: data };
      }
    } catch (e) {}

    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'donki_solar_flares.json'), 'utf8'));
      return { status: 'CACHED', flares: cached };
    } catch (e) {
      return { status: 'OFFLINE', flares: [] };
    }
  },

  /**
   * Generates real solar storm scenario parameters from DONKI telemetry
   */
  getScenarioFromAlert(alert = null) {
    // If no alert provided, load sample X8.7 flare
    let event = alert;
    if (!event) {
      try {
        event = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'donki_sample.json'), 'utf8'));
      } catch (e) {}
    }

    const flareClass = event?.classType || 'X8.7';
    let countdown = 30.0;
    let spikeRate = 22.0;

    if (flareClass.startsWith('X')) {
      const num = parseFloat(flareClass.slice(1)) || 5.0;
      countdown = Math.max(18, Math.round(35 - num * 1.2));
      spikeRate = Math.min(45, 15 + num * 1.5);
    } else if (flareClass.startsWith('M')) {
      countdown = 45.0;
      spikeRate = 10.0;
    } else {
      countdown = 55.0;
      spikeRate = 4.0;
    }

    return {
      flareClass,
      messageID: event?.messageID || '20240514-FLR-001',
      issueTime: event?.messageIssueTime || event?.beginTime || '2024-05-14T17:15:00Z',
      activeRegion: event?.sourceLocation || 'Sunspot AR3664',
      countdownSeconds: countdown,
      radiationRateSpike: spikeRate,
      scientificExplanation: `Solar Flare Class ${flareClass} detected by GOES-16 solar X-ray sensor. High-energy X-rays and proton storm require immediate evacuation to regolith shelter.`,
      safetyProtocol: "Seal subterranean radiation shelter hatch. Regolith provides 95% particle attenuation."
    };
  }
};

module.exports = DonkiService;
