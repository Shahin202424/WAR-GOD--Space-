/**
 * NASA Data Coordinator & Architecture Manager
 * Coordinates DONKI, OSDR, RadLab, Mars Trek, and NASA Images Library
 * Handles caching, timeouts, offline fallbacks, and honest data attribution.
 */

const NasaDataManager = {
  demoData: null,
  isInitialized: false,
  apiKey: 'DEMO_KEY',
  systemStatus: 'INITIALIZING', // LIVE DATA | DEMO MODE | OFFLINE

  /**
   * Load bundled demo-data.json and initialize all NASA modules
   */
  async initialize(customApiKey = null) {
    this.apiKey = customApiKey || 'DEMO_KEY';
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('junior_astro_nasa_api_key');
      }
    } catch (e) {}

    try {
      const res = await fetch('data/demo-data.json');
      if (res.ok) {
        this.demoData = await res.json();
      }
    } catch (e) {
      console.warn('Could not load local demo-data.json, using memory fallbacks:', e.message);
    }

    console.log('🚀 Initializing All Five NASA Data Integrations...');
    const results = await Promise.allSettled([
      window.NasaDonki?.fetchSpaceWeather(this.apiKey, this.demoData?.donki),
      window.NasaOsdr?.fetchStudies(this.demoData?.osdr),
      window.NasaRadlab?.fetchRadiationData(this.demoData?.radlab),
      window.NasaMarsTrek?.init(this.demoData?.marstrek),
      window.NasaImages?.fetchMarsPhotos('mars rover perseverance', this.demoData?.images)
    ]);

    const statuses = [
      window.NasaDonki?.status,
      window.NasaOsdr?.status,
      window.NasaRadlab?.status,
      window.NasaMarsTrek?.status,
      window.NasaImages?.status
    ];

    const hasLive = statuses.some(s => s === 'LIVE' || s === 'LIVE DATA');
    const hasHistorical = statuses.some(s => s === 'HISTORICAL');
    const allOffline = statuses.every(s => s === 'OFFLINE' || !s);

    if (hasLive) {
      this.systemStatus = 'LIVE';
    } else if (hasHistorical) {
      this.systemStatus = 'HISTORICAL';
    } else if (allOffline) {
      this.systemStatus = 'OFFLINE';
    } else {
      this.systemStatus = 'CACHED';
    }

    this.isInitialized = true;
    console.log(`📡 NASA Data Manager initialized with aggregate status: ${this.systemStatus}`, statuses);

    window.dispatchEvent(new CustomEvent('nasa-data-updated', {
      detail: this.getTelemetryReport()
    }));

    return this.getTelemetryReport();
  },

  getTelemetryReport() {
    return {
      aggregateStatus: this.systemStatus,
      timestamp: new Date().toISOString(),
      services: {
        donki: {
          name: 'NASA DONKI Space Weather',
          status: window.NasaDonki?.status || 'DEMO MODE',
          lastUpdated: window.NasaDonki?.lastUpdated,
          source: 'https://ccmc.gsfc.nasa.gov/DONKI/',
          apiEndpoint: 'https://api.nasa.gov/DONKI/notifications',
          summary: window.NasaDonki?.cachedAlert?.title || 'Solar Flare & CME Telemetry Active',
          gameplayImpact: 'Triggers radiation sirens, solar storm evacuations, and shelter shielding drills.'
        },
        osdr: {
          name: 'NASA OSDR Space Biology',
          status: window.NasaOsdr?.status || 'DEMO MODE',
          lastUpdated: window.NasaOsdr?.lastUpdated,
          source: 'https://osdr.nasa.gov/bio/repo/',
          apiEndpoint: 'https://osdr.nasa.gov/osdr/data/osd/meta/87',
          summary: `${window.NasaOsdr?.studies?.length || 5} biological spaceflight studies loaded (OSD-87, OSD-137, OSD-243, OSD-47, OSD-178)`,
          gameplayImpact: 'Educates on astronaut vision, 2-hr daily workouts for muscle/bone density, and hydroponic greenhouses.'
        },
        radlab: {
          name: 'NASA RadLab Space Radiation',
          status: window.NasaRadlab?.status || 'DEMO MODE',
          lastUpdated: window.NasaRadlab?.lastUpdated,
          source: 'https://visualization.osdr.nasa.gov/radlab/gui/',
          apiEndpoint: 'https://visualization.osdr.nasa.gov/radlab/api/?spacecraft=ISS',
          summary: `${window.NasaRadlab?.records?.length || 3} radiation telemetry records (ISS Liulin-5, Mars Curiosity RAD, Moon LRO CRaTER)`,
          gameplayImpact: 'Powers live radiation dosimeter HUD and teaches regolith and water ice shielding.'
        },
        marstrek: {
          name: 'NASA Mars Trek Cartography',
          status: window.NasaMarsTrek?.status || 'DEMO MODE',
          lastUpdated: window.NasaMarsTrek?.lastUpdated,
          source: 'https://trek.nasa.gov/mars/',
          apiEndpoint: 'https://trek.nasa.gov/tiles/Mars/EQ/.../0/0/0.jpg',
          summary: 'MGS MOLA Color Shaded Relief WMTS Topography & Real Landmarks',
          gameplayImpact: 'Provides real elevation and surface coordinates for landing sites, rover traverses, and base construction.'
        },
        images: {
          name: 'NASA Image & Video Library',
          status: window.NasaImages?.status || 'DEMO MODE',
          lastUpdated: window.NasaImages?.lastUpdated,
          source: 'https://images.nasa.gov/',
          apiEndpoint: 'https://images-api.nasa.gov/search',
          summary: `${window.NasaImages?.cachedPhotos?.length || 8} authentic space exploration photographs with NASA center credit`,
          gameplayImpact: 'Displays real NASA photography in level briefings and science learning popups.'
        }
      }
    };
  },

  setApiKey(key) {
    this.apiKey = (key && key.trim()) ? key.trim() : 'DEMO_KEY';
    this.initialize(this.apiKey);
  }
};

window.NasaDataManager = NasaDataManager;
