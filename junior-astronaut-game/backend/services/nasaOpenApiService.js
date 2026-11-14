/**
 * NASA Open API & Image Library Service
 * Source: https://api.nasa.gov/ & https://images.nasa.gov/
 */

const fs = require('fs');
const path = require('path');

const LOCAL_FALLBACK = path.join(__dirname, '..', '..', 'NASA_DATA_RESOURCES', '01_NASA_OPEN_API');

const NasaOpenApiService = {
  async getApod(apiKey = 'DEMO_KEY') {
    const targetUrl = `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'LIVE',
          source: 'NASA APOD API (api.nasa.gov)',
          data: data
        };
      }
    } catch (e) {}

    // Fallback to verified local cached file
    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'apod.json'), 'utf8'));
      return {
        status: 'CACHED',
        source: 'NASA APOD Archive (Verified SDO/AIA Observation)',
        data: cached
      };
    } catch (e) {
      return { status: 'OFFLINE', data: null };
    }
  },

  async searchPhotos(query = 'mars rover perseverance') {
    const targetUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
    try {
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'LIVE',
          source: 'NASA Image and Video Library (images-api.nasa.gov)',
          items: data.collection?.items || []
        };
      }
    } catch (e) {}

    // Fallback
    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'mars_photos.json'), 'utf8'));
      return {
        status: 'CACHED',
        source: 'NASA Image Archive (Verified JPL-Caltech Photography)',
        items: cached.collection?.items || []
      };
    } catch (e) {
      return { status: 'OFFLINE', items: [] };
    }
  },

  async getMarsPhotos(query = 'mars rover perseverance') {
    return this.searchPhotos(query);
  }
};

module.exports = NasaOpenApiService;
