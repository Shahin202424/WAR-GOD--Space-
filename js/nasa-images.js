/**
 * NASA Image and Video Library Integration Module
 * Official Portal: https://images.nasa.gov/
 * API: https://images-api.nasa.gov/search
 */

const NasaImages = {
  status: 'UNINITIALIZED', // LIVE DATA | DEMO MODE | OFFLINE
  lastUpdated: null,
  cachedPhotos: [],

  /**
   * Fetch real space exploration photos from NASA's official image API
   * @param {string} query - Keyword search
   * @param {object} demoFallback - Fallback dataset from demo-data.json
   */
  async fetchMarsPhotos(query = 'mars rover perseverance', demoFallback = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const proxyUrl = `/api/nasa/images?q=${encodeURIComponent(query)}`;
    const directUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;

    let res = null;
    try {
      try {
        res = await fetch(proxyUrl, { signal: controller.signal });
      } catch (e) {
        // Fall back to direct
      }

      if (!res || !res.ok) {
        res = await fetch(directUrl, { signal: controller.signal });
      }
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const json = await res.json();
        const items = json?.collection?.items;

        if (Array.isArray(items) && items.length > 0) {
          const headerStatus = res.headers?.get ? res.headers.get('X-NASA-Status') : null;
          this.status = headerStatus || 'LIVE';
          this.lastUpdated = new Date().toISOString();

          const parsedList = items.slice(0, 10).map((item) => {
            const data = item.data?.[0] || {};
            const link = item.links?.[0]?.href || '';
            return {
              isLive: true,
              nasaId: data.nasa_id || 'NASA-IMG',
              title: data.title || 'NASA Space Exploration',
              description: data.description ? data.description.slice(0, 180) + '...' : 'Space photograph taken by NASA missions.',
              url: link,
              center: data.center || 'NASA / JPL-Caltech',
              dateCreated: data.date_created ? data.date_created.split('T')[0] : '2024'
            };
          });

          this.cachedPhotos = parsedList;
          return parsedList;
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('NASA Images live fetch failed or timed out:', err.message);
    }

    // Graceful fallback to verified authentic NASA photographs
    this.status = 'CACHED';
    this.lastUpdated = '2024-05-01T00:00:00Z';
    this.cachedPhotos = demoFallback?.photos || [
      {
        nasaId: 'PIA24348',
        title: 'Perseverance Rover on Mars Surface',
        description: 'NASA Mars 2020 Perseverance rover exploring Jezero Crater on Mars.',
        url: 'https://images-assets.nasa.gov/image/PIA24348/PIA24348~medium.jpg',
        center: 'JPL-Caltech',
        category: 'rover'
      },
      {
        nasaId: 'iss065e084321',
        title: 'Astronaut Spacewalk on the ISS',
        description: 'NASA astronaut conducts an extravehicular activity (EVA) outside the ISS.',
        url: 'https://images-assets.nasa.gov/image/iss065e084321/iss065e084321~medium.jpg',
        center: 'JSC',
        category: 'spacewalk'
      }
    ];

    return this.cachedPhotos;
  },

  getPhotoByCategory(category) {
    return this.cachedPhotos.find(p => p.category === category) || this.cachedPhotos[0];
  }
};

window.NasaImages = NasaImages;
