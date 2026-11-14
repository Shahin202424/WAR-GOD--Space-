/**
 * NASA DONKI Integration Module
 * Space Weather Database Of Notifications, Knowledge, Information
 * Official Portal: https://ccmc.gsfc.nasa.gov/DONKI/
 * API: https://api.nasa.gov/DONKI/
 * 
 * Tracks solar flares (FLR), Coronal Mass Ejections (CME), Solar Energetic Particles (SEP),
 * Radiation Belt Enhancements (RBE), Geomagnetic Storms (GST), High Speed Streams (HSS),
 * and WSA-ENLIL simulations.
 */

const NasaDonki = {
  status: 'UNINITIALIZED', // LIVE DATA | DEMO MODE (Archive) | OFFLINE
  lastUpdated: null,
  cachedAlert: null,
  allEvents: [],

  /**
   * Fetch latest space weather notifications or fall back gracefully
   * @param {string} apiKey - Optional NASA API Key (defaults to DEMO_KEY)
   * @param {object} demoFallback - Fallback dataset from demo-data.json
   */
  async fetchSpaceWeather(apiKey = 'DEMO_KEY', demoFallback = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const now = new Date();
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = past.toISOString().split('T')[0];

    // Try server proxy first if running via server.js, else direct api.nasa.gov
    const proxyUrl = `/api/nasa/donki?startDate=${startDate}&type=all`;
    const directUrl = `https://api.nasa.gov/DONKI/notifications?startDate=${startDate}&type=all&api_key=${encodeURIComponent(apiKey)}`;

    let response = null;
    try {
      try {
        response = await fetch(proxyUrl, { signal: controller.signal });
      } catch (e) {
        // Proxy not running, fall back to direct request
      }

      if (!response || !response.ok) {
        response = await fetch(directUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
      }
      clearTimeout(timeoutId);

      if (response && response.ok) {
        const rawList = await response.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const headerStatus = response.headers?.get ? response.headers.get('X-NASA-Status') : null;
          this.status = headerStatus || 'LIVE';
          this.lastUpdated = new Date().toISOString();
          this.allEvents = rawList.map(item => this.parseDonkiNotification(item, true));
          this.cachedAlert = this.allEvents[0];
          return this.cachedAlert;
        }
      } else if (response && response.status === 429) {
        console.warn('NASA DONKI: Rate limit reached (HTTP 429). Switching to verified NASA archive data.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('NASA DONKI live fetch failed or timed out:', err.message);
    }

    // Graceful fallback to verified authentic historic NASA DONKI events
    this.status = 'HISTORICAL';
    const fallbackList = demoFallback?.events || [
      {
        messageType: 'FLR',
        messageID: 'HISTORIC-FLR-X8.7',
        messageIssueTime: '2024-05-14T17:15:00Z',
        classType: 'X8.7',
        source: 'NASA SDO / DONKI (Historic May 2024 Event)',
        childTitle: 'Giant Solar Flare (Class X8.7)!',
        childExplanation: 'A super-powered solar flare erupted on the Sun! High-energy particles are traveling through space across the solar system.',
        safetyAction: 'Sprint to the subterranean lava tube shelter! Martian dirt blocks space radiation.',
        gameplayImpact: 'Radiation spikes by +45 µSv/h.'
      }
    ];

    this.allEvents = fallbackList;
    const chosen = fallbackList[0];
    this.lastUpdated = chosen.messageIssueTime || '2024-05-14T17:15:00Z';
    const parsedFallback = this.formatFallbackEvent(chosen);
    this.cachedAlert = parsedFallback;
    return parsedFallback;
  },

  /**
   * Parse a raw DONKI notification into child-friendly format
   */
  parseDonkiNotification(raw, isLive = true) {
    const msgType = raw.messageType || 'SPACE_WEATHER';
    const issueTime = raw.messageIssueTime || new Date().toISOString();
    let body = raw.messageBody || '';

    let alertTitle = 'Space Weather Warning!';
    let simpleDescription = 'NASA satellites detected a space weather disturbance traveling through the solar system!';
    let safetyAdvice = 'Seek shelter inside the thick-walled Mars habitat dome.';
    let radiationRisk = 'Moderate';
    let stormType = msgType;

    if (msgType.includes('FLR') || body.includes('Solar Flare')) {
      alertTitle = 'Solar Flare Detected (FLR)!';
      simpleDescription = 'The Sun released an intense flash of light and high-energy radiation!';
      safetyAdvice = 'Mars has no global magnetic field to protect us. Reach the subterranean shelter!';
      radiationRisk = 'High';
      stormType = 'FLR';
    } else if (msgType.includes('CME') || body.includes('Coronal Mass Ejection')) {
      alertTitle = 'Solar Plasma Wave (CME)!';
      simpleDescription = 'A huge bubble of billions of tons of magnetized solar plasma is expanding across the planets!';
      safetyAdvice = 'Retract rover solar arrays to avoid power surges and take cover under thick regolith!';
      radiationRisk = 'Severe';
      stormType = 'CME';
    } else if (msgType.includes('SEP') || body.includes('Energetic Particle')) {
      alertTitle = 'Solar Energetic Particles (SEP)!';
      simpleDescription = 'Super-fast protons are streaming through interplanetary space!';
      safetyAdvice = 'Deploy hydrogen-rich water shields inside astronaut sleep quarters.';
      radiationRisk = 'Critical';
      stormType = 'SEP';
    } else if (msgType.includes('RBE')) {
      alertTitle = 'Radiation Belt Enhancement (RBE)!';
      simpleDescription = 'Planetary radiation belts have energized into dense electron clouds!';
      safetyAdvice = 'Navigate spacecraft outside peak radiation zones.';
      radiationRisk = 'High';
      stormType = 'RBE';
    } else if (msgType.includes('GST') || body.includes('Geomagnetic')) {
      alertTitle = 'Interplanetary Geomagnetic Storm (GST)!';
      simpleDescription = 'A planetary space storm is buffeting outer space!';
      safetyAdvice = 'Move inside the subterranean lava tube shelter immediately!';
      radiationRisk = 'High';
      stormType = 'GST';
    } else if (msgType.includes('HSS')) {
      alertTitle = 'High Speed Solar Stream (HSS)!';
      simpleDescription = 'Fast solar wind gusts are creating radio static in space communications!';
      safetyAdvice = 'Boost signal power on high-gain communication dishes.';
      radiationRisk = 'Low';
      stormType = 'HSS';
    }

    return {
      isLive,
      messageType: stormType,
      messageID: raw.messageID || 'DONKI-ALERT',
      issueTime: issueTime,
      dateString: new Date(issueTime).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      title: alertTitle,
      description: simpleDescription,
      safetyAdvice: safetyAdvice,
      radiationRisk: radiationRisk,
      rawBody: body.slice(0, 240) + '...',
      source: 'NASA Space Weather Database (DONKI)',
      officialUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/'
    };
  },

  formatFallbackEvent(ev) {
    return {
      isLive: false,
      messageType: ev.messageType,
      messageID: ev.messageID,
      issueTime: ev.messageIssueTime,
      dateString: new Date(ev.messageIssueTime).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      title: ev.childTitle,
      description: ev.childExplanation,
      safetyAdvice: ev.safetyAction,
      radiationRisk: ev.messageType === 'FLR' || ev.messageType === 'SEP' ? 'Critical' : 'High',
      rawBody: `Historic NASA DONKI Record: ${ev.source}. Class: ${ev.classType || ev.speed || 'Archived'}.`,
      source: ev.source || 'NASA DONKI Historic Database',
      officialUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/'
    };
  }
};

window.NasaDonki = NasaDonki;
