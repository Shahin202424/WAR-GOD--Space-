/**
 * NASA Mars Trek Cartography & Topography Service
 * Official Source: https://trek.nasa.gov/mars/
 * Tile Server: https://trek.nasa.gov/tiles/
 */

const fs = require('fs');
const path = require('path');

const LOCAL_FALLBACK = path.join(__dirname, '..', '..', 'NASA_DATA_RESOURCES', '05_NASA_MARS_TREK');

const MarsTrekService = {
  getWmtsCapabilitiesSnippet() {
    try {
      const metadata = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'mars_map_metadata.json'), 'utf8'));
      return { status: 'CACHED', metadata };
    } catch (e) {
      return { status: 'OFFLINE', metadata: null };
    }
  },

  getLandmarks() {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'mars_layers.json'), 'utf8'));
      return {
        status: 'CACHED',
        source: 'NASA Mars Trek / USGS Astrogeology Science Center',
        landmarks: data.keyLandmarks || []
      };
    } catch (e) {
      return { status: 'OFFLINE', landmarks: [] };
    }
  },

  /**
   * Evaluate terrain suitability for landing and base construction
   */
  evaluateSite(landmarkId) {
    const sites = {
      jezero: {
        id: "jezero",
        name: "Jezero Crater Delta",
        elevationKm: -2.5,
        slopeDegrees: 3.2,
        boulderDensity: "Medium",
        subsurfaceWaterIce: "Detected in clay minerals",
        landingSafety: "HIGH",
        recommendedBaseModule: "Bio-Greenhouse & Science Lab"
      },
      arcadia: {
        id: "arcadia",
        name: "Arcadia Planitia Plains",
        elevationKm: -4.0,
        slopeDegrees: 1.1,
        boulderDensity: "Low",
        subsurfaceWaterIce: "Abundant (pure sheet ice 30cm below surface)",
        landingSafety: "OPTIMAL",
        recommendedBaseModule: "Water Extraction Plant & Solar Farm"
      },
      olympus: {
        id: "olympus",
        name: "Olympus Mons Caldera",
        elevationKm: 21.9,
        slopeDegrees: 18.5,
        boulderDensity: "Extreme (Basaltic lava flows)",
        subsurfaceWaterIce: "None detected",
        landingSafety: "DANGEROUS",
        recommendedBaseModule: "High-Altitude Relay Antenna"
      }
    };

    return sites[landmarkId] || sites.jezero;
  }
};

module.exports = MarsTrekService;
