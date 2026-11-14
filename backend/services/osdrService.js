/**
 * NASA OSDR Space Biology Service
 * Official Source: https://osdr.nasa.gov/bio/repo/
 * Study API: https://osdr.nasa.gov/osdr/data/osd/meta/87
 * Subject API: https://osdr.nasa.gov/geode-py/ws/api/subject/195
 */

const fs = require('fs');
const path = require('path');

const LOCAL_FALLBACK = path.join(__dirname, '..', '..', 'NASA_DATA_RESOURCES', '03_NASA_OSDR');

const OsdrService = {
  async getStudy87() {
    try {
      const res = await fetch('https://osdr.nasa.gov/osdr/data/osd/meta/87', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return {
          status: 'LIVE',
          source: 'NASA Open Science Data Repository (osdr.nasa.gov)',
          study: data.study?.['OSD-87'] || data
        };
      }
    } catch (e) {}

    // Fallback
    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'osdr_study_87.json'), 'utf8'));
      return {
        status: 'CACHED',
        source: 'NASA OSDR Archive (STS-135 Spaceflight Mouse Retina Study)',
        study: cached.study?.['OSD-87'] || cached
      };
    } catch (e) {
      return { status: 'OFFLINE', study: null };
    }
  },

  async getSubject195() {
    try {
      const res = await fetch('https://osdr.nasa.gov/geode-py/ws/api/subject/195', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return { status: 'LIVE', subject: data };
      }
    } catch (e) {}

    try {
      const cached = JSON.parse(fs.readFileSync(path.join(LOCAL_FALLBACK, 'osdr_subjects.json'), 'utf8'));
      return { status: 'CACHED', subject: cached };
    } catch (e) {
      return { status: 'OFFLINE', subject: null };
    }
  },

  /**
   * Educational health modules mapped to OSDR studies
   */
  getHealthCurriculum() {
    return [
      {
        studyId: "OSD-87",
        title: "Spaceflight Ocular & Vision Research (STS-135)",
        finding: "Zero-G fluid shift and cosmic radiation affect retina vascular networks.",
        gameAction: "Verify astronaut helmet gold visor is sealed (reflects 99% UV/solar rays).",
        archetype: "systems"
      },
      {
        studyId: "OSD-137",
        title: "ISS Advanced Plant Habitat (Arabidopsis thaliana)",
        finding: "Plants thrive under calibrated red (660nm) and blue (430nm) LED illumination.",
        gameAction: "Tune hydroponic growth spectrum to harvest fresh space salad.",
        archetype: "biolab"
      },
      {
        studyId: "OSD-243",
        title: "Astronaut Bone Density & Muscle Mass Preservation",
        finding: "Astronauts require 2 hours of daily resistance training (ARED) to prevent 1% bone loss per month.",
        gameAction: "Execute 5 workout reps on the ARED gym equipment to boost Health.",
        archetype: "biolab"
      }
    ];
  }
};

module.exports = OsdrService;
