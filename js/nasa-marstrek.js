/**
 * NASA Mars Trek Integration Module
 * Mars Map Tile Service (WMTS) & Planetary Cartography
 * Official Portal: https://trek.nasa.gov/mars/
 * API Docs: https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars
 * 
 * Uses real Mars Global Surveyor (MGS) MOLA Color Shaded Relief global maps
 * and coordinates for real Martian & Lunar landmarks.
 */

const NasaMarsTrek = {
  status: 'UNINITIALIZED', // LIVE DATA | DEMO MODE | OFFLINE
  lastUpdated: null,
  wmtsLayer: 'Mars_MGS_MOLA_ClrShade_merge_global_463m',
  tileTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  landmarks: [],
  activeTileImage: null,

  /**
   * Initialize Mars Trek layer and test WMTS connectivity
   * @param {object} demoFallback - Fallback dataset from demo-data.json
   */
  async init(demoFallback = null) {
    this.landmarks = demoFallback?.landmarks || [
      {
        id: 'jezero',
        name: 'Jezero Crater',
        lat: 18.38,
        lon: 77.58,
        elevation: '-2.5 km',
        feature: 'Ancient River Delta & Lake',
        nasaMission: 'Perseverance Rover & Ingenuity Helicopter',
        childDescription: 'A dried-up Martian lake where Perseverance searches for signs of ancient microscopic life!'
      },
      {
        id: 'olympus',
        name: 'Olympus Mons',
        lat: 18.65,
        lon: 226.2,
        elevation: '+21.9 km',
        feature: 'Largest Volcano in the Solar System',
        nasaMission: 'Mars Reconnaissance Orbiter',
        childDescription: 'A colossal volcano 22 km tall—3 times higher than Mount Everest!'
      },
      {
        id: 'valles',
        name: 'Valles Marineris',
        lat: -13.9,
        lon: 300.8,
        elevation: '-7.0 km',
        feature: 'The Grand Canyon of Mars',
        nasaMission: 'Viking & Odyssey Orbiters',
        childDescription: 'A gigantic canyon stretching 4,000 kilometers across the Martian equator!'
      },
      {
        id: 'gale',
        name: 'Gale Crater',
        lat: -5.4,
        lon: 137.8,
        elevation: '-4.5 km',
        feature: 'Curiosity Rover Landing Site',
        nasaMission: 'Curiosity Rover',
        childDescription: 'An ancient crater with a 5 km high mountain of layered rock in the middle!'
      },
      {
        id: 'arcadia',
        name: 'Arcadia Planitia',
        lat: 39.3,
        lon: 189.7,
        elevation: '-4.0 km',
        feature: 'Subsurface Water Ice Glaciers',
        nasaMission: 'Mars Odyssey GRS',
        childDescription: 'Wide smooth plains with abundant water ice buried just inches beneath the soil.'
      },
      {
        id: 'shackleton',
        name: 'Shackleton Crater (Moon South Pole)',
        lat: -89.9,
        lon: 0.0,
        elevation: '-4.2 km',
        feature: 'Permanently Shadowed Lunar Water Ice',
        nasaMission: 'Artemis & LRO',
        childDescription: 'Deep craters at the Moon’s pole that hold ancient water ice untouched for billions of years.'
      }
    ];

    // Test live WMTS tile loading
    const testTileUrl = this.getTileUrl(0, 0, 0);

    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        this.status = 'CACHED';
        this.lastUpdated = '2024-05-01T00:00:00Z';
        console.warn('NASA Mars Trek WMTS live tile timed out, using verified local MOLA tile.');
        const localImg = new Image();
        localImg.src = 'NASA_DATA_RESOURCES/05_NASA_MARS_TREK/mars_tile_0_0_0.jpg';
        this.activeTileImage = localImg;
        resolve(this.landmarks);
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        this.status = 'LIVE';
        this.lastUpdated = new Date().toISOString();
        this.activeTileImage = img;
        resolve(this.landmarks);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        this.status = 'CACHED';
        this.lastUpdated = '2024-05-01T00:00:00Z';
        console.warn('NASA Mars Trek WMTS live tile failed to load, using verified local MOLA tile.');
        const localImg = new Image();
        localImg.src = 'NASA_DATA_RESOURCES/05_NASA_MARS_TREK/mars_tile_0_0_0.jpg';
        this.activeTileImage = localImg;
        resolve(this.landmarks);
      };

      img.crossOrigin = 'anonymous';
      img.src = testTileUrl;
    });
  },

  getTileUrl(z = 0, y = 0, x = 0) {
    return this.tileTemplate
      .replace('{z}', z)
      .replace('{y}', y)
      .replace('{x}', x);
  },

  getLandmark(id) {
    return this.landmarks.find(l => l.id === id) || this.landmarks[0];
  }
};

window.NasaMarsTrek = NasaMarsTrek;
