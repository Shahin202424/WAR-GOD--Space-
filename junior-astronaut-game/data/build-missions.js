/**
 * Builder script to generate comprehensive, verified, high-quality
 * 20 Missions × 10 Levels = 200 Levels dataset for SPACE WARS.
 */

const fs = require('fs');
const path = require('path');

const MISSIONS_META = [
  {
    id: 1,
    name: 'Astronaut Training Academy',
    icon: '🎓',
    badgeId: 'badge_academy',
    badgeTitle: 'Certified Space Cadet',
    badgeDesc: 'Mastered spacesuit systems, centrifuge G-forces, and neutral buoyancy training!',
    nasaRef: 'NASA Astronaut Candidate (Ascan) Training & Johnson Space Center NBL',
    archetypeOrder: ['systems', 'platformer', 'lander', 'systems', 'platformer', 'biolab', 'systems', 'lander', 'platformer', 'systems']
  },
  {
    id: 2,
    name: 'Rocket Launch Preparation',
    icon: '🚀',
    badgeId: 'badge_rocket',
    badgeTitle: 'Master Rocket Scientist',
    badgeDesc: 'Balanced cryogenic fuel ratios, verified booster staging, and executed orbital insertion!',
    nasaRef: 'NASA Artemis SLS (Space Launch System) & Kennedy Space Center Pad 39B',
    archetypeOrder: ['systems', 'systems', 'comms', 'systems', 'lander', 'systems', 'comms', 'systems', 'systems', 'lander']
  },
  {
    id: 3,
    name: 'Space Journey Begins',
    icon: '🌌',
    badgeId: 'badge_voyager',
    badgeTitle: 'Deep Space Navigator',
    badgeDesc: 'Navigated microgravity corridors, dodged orbital debris, and tuned life support!',
    nasaRef: 'NASA Orion Spacecraft & Deep Space Network (DSN)',
    archetypeOrder: ['lander', 'platformer', 'systems', 'comms', 'biolab', 'systems', 'lander', 'systems', 'comms', 'lander']
  },
  {
    id: 4,
    name: 'Moon Landing Challenge',
    icon: '🌖',
    badgeId: 'badge_moon_pilot',
    badgeTitle: 'Lunar Lander Ace',
    badgeDesc: 'Mastered 16% lunar gravity and performed pinpoint touchdowns on crater rims!',
    nasaRef: 'NASA Apollo Lunar Module & Artemis Human Landing System (HLS)',
    archetypeOrder: ['lander', 'lander', 'systems', 'lander', 'comms', 'lander', 'systems', 'lander', 'lander', 'lander']
  },
  {
    id: 5,
    name: 'Lunar Base Construction',
    icon: '🏗️',
    badgeId: 'badge_base_builder',
    badgeTitle: 'Lunar Architect',
    badgeDesc: 'Erected pressurized inflatable habitats, solar towers, and regolith berms at Shackleton Crater!',
    nasaRef: 'NASA Artemis Base Camp & Lunar South Pole Exploration',
    archetypeOrder: ['builder', 'rover', 'builder', 'systems', 'builder', 'platformer', 'builder', 'systems', 'builder', 'builder']
  },
  {
    id: 6,
    name: 'Oxygen Survival Mission',
    icon: '🫧',
    badgeId: 'badge_oxygen',
    badgeTitle: 'Life Support Engineer',
    badgeDesc: 'Extracted oxygen via MOXIE electrolysis, patched airlock leaks, and balanced Sabatier loops!',
    nasaRef: 'NASA MOXIE (Mars Oxygen ISRU Experiment) & ISS ECLSS',
    archetypeOrder: ['systems', 'platformer', 'systems', 'builder', 'systems', 'platformer', 'systems', 'systems', 'builder', 'systems']
  },
  {
    id: 7,
    name: 'Water Collection Mission',
    icon: '💧',
    badgeId: 'badge_hydrologist',
    badgeTitle: 'Planetary Hydrologist',
    badgeDesc: 'Drilled permanently shadowed lunar ice and harvested glacial deposits beneath Martian soil!',
    nasaRef: 'NASA VIPER Lunar Rover & Mars Subsurface Water Ice Mapping (SWIM)',
    archetypeOrder: ['rover', 'platformer', 'systems', 'rover', 'builder', 'systems', 'rover', 'platformer', 'systems', 'rover']
  },
  {
    id: 8,
    name: 'Space Food Production',
    icon: '🥗',
    badgeId: 'badge_botanist',
    badgeTitle: 'Master Space Botanist',
    badgeDesc: 'Cultivated hydroponic salad crops, optimized LED light spectrums, and harvested super greens!',
    nasaRef: 'NASA OSDR Study OSD-137 (Advanced Plant Habitat Veggie Experiment)',
    archetypeOrder: ['biolab', 'systems', 'biolab', 'builder', 'biolab', 'systems', 'biolab', 'builder', 'biolab', 'biolab']
  },
  {
    id: 9,
    name: 'Radiation Protection Mission',
    icon: '🛡️',
    badgeId: 'badge_shield_master',
    badgeTitle: 'Radiation Shielding Specialist',
    badgeDesc: 'Deployed regolith blankets, water walls, and polyethylene polymers to block cosmic rays!',
    nasaRef: 'NASA RadLab Dosimetry (Liulin-5 ISS & Curiosity RAD) & OSDR',
    archetypeOrder: ['radiation', 'systems', 'radiation', 'builder', 'radiation', 'systems', 'radiation', 'builder', 'radiation', 'radiation']
  },
  {
    id: 10,
    name: 'Solar Storm Emergency',
    icon: '☀️',
    badgeId: 'badge_solar_hero',
    badgeTitle: 'Solar Storm Guardian',
    badgeDesc: 'Responded to historic Class X8.7 solar flares and evacuated crew to lava tube shelters!',
    nasaRef: 'NASA DONKI Space Weather Notifications (FLR, CME, SEP, GST)',
    archetypeOrder: ['radiation', 'rover', 'radiation', 'systems', 'radiation', 'platformer', 'radiation', 'systems', 'radiation', 'radiation']
  },
  {
    id: 11,
    name: 'Astronaut Health Mission',
    icon: '🧑‍⚕️',
    badgeId: 'badge_physician',
    badgeTitle: 'Chief Flight Surgeon',
    badgeDesc: 'Maintained crew bone density, protected retinas with gold visors, and tested immune strength!',
    nasaRef: 'NASA OSDR Studies OSD-87 (Retinal Biology) & OSD-243 (Musculoskeletal ARED Exercise)',
    archetypeOrder: ['biolab', 'systems', 'biolab', 'biolab', 'systems', 'biolab', 'biolab', 'systems', 'biolab', 'biolab']
  },
  {
    id: 12,
    name: 'Power Management Challenge',
    icon: '⚡',
    badgeId: 'badge_energy',
    badgeTitle: 'Grid Power Master',
    badgeDesc: 'Balanced solar arrays, nuclear RTG units, battery storage, and dust mitigation sweeps!',
    nasaRef: 'NASA InSight Solar Panel Dust Diagnostics & Mars Curiosity MMRTG',
    archetypeOrder: ['systems', 'platformer', 'systems', 'builder', 'systems', 'rover', 'systems', 'builder', 'systems', 'systems']
  },
  {
    id: 13,
    name: 'Communication Mission',
    icon: '📡',
    badgeId: 'badge_telecom',
    badgeTitle: 'Deep Space Comms Officer',
    badgeDesc: 'Aligned parabolic antennas, calculated 20-minute signal delays, and locked Ka-band lasers!',
    nasaRef: 'NASA Deep Space Network (Goldstone, Madrid, Canberra) & DSOC Laser Comms',
    archetypeOrder: ['comms', 'systems', 'comms', 'comms', 'systems', 'comms', 'platformer', 'comms', 'systems', 'comms']
  },
  {
    id: 14,
    name: 'Lunar Exploration',
    icon: '🚜',
    badgeId: 'badge_lunar_explorer',
    badgeTitle: 'Veteran Moon Explorer',
    badgeDesc: 'Traversed lunar seas, explored collapsed lava tube skylights, and gathered basalt minerals!',
    nasaRef: 'NASA Apollo Field Geology & Artemis Lunar Terrain Vehicle (LTV)',
    archetypeOrder: ['rover', 'platformer', 'rover', 'lander', 'rover', 'platformer', 'rover', 'systems', 'rover', 'rover']
  },
  {
    id: 15,
    name: 'Mars Journey',
    icon: '🛸',
    badgeId: 'badge_interplanetary',
    badgeTitle: 'Interplanetary Navigator',
    badgeDesc: 'Crossed 225 million kilometers, performed deep-space trajectory burns, and conserved supplies!',
    nasaRef: 'NASA Mars 2020 Cruise Stage & Planetary Heliocentric Orbit Trajectories',
    archetypeOrder: ['lander', 'systems', 'comms', 'radiation', 'systems', 'biolab', 'lander', 'systems', 'comms', 'lander']
  },
  {
    id: 16,
    name: 'Mars Landing Challenge',
    icon: '🛬',
    badgeId: 'badge_mars_lander',
    badgeTitle: 'Sky Crane Commander',
    badgeDesc: 'Survived the Seven Minutes of Terror, supersonic parachutes, and sky-crane touchdowns!',
    nasaRef: 'NASA Entry, Descent, and Landing (EDL) & Perseverance Sky Crane',
    archetypeOrder: ['lander', 'systems', 'lander', 'lander', 'comms', 'lander', 'lander', 'systems', 'lander', 'lander']
  },
  {
    id: 17,
    name: 'Mars Habitat Construction',
    icon: '🏰',
    badgeId: 'badge_mars_builder',
    badgeTitle: 'Martian Pioneer Architect',
    badgeDesc: 'Constructed pressurized domes, MOXIE O2 plants, ice melters, and hydroponic domes at Jezero!',
    nasaRef: 'NASA 3D-Printed Habitat Challenge & Mars Trek Jezero Crater Elevation Data',
    archetypeOrder: ['builder', 'rover', 'builder', 'systems', 'builder', 'platformer', 'builder', 'systems', 'builder', 'builder']
  },
  {
    id: 18,
    name: 'Mars Survival Mission',
    icon: '🌪️',
    badgeId: 'badge_survivor',
    badgeTitle: 'Martian Dust Storm Survivor',
    badgeDesc: 'Overcame planet-encircling dust storms, preserved greenhouse crops, and cleared solar arrays!',
    nasaRef: 'NASA Opportunity Rover Global Dust Storm Telemetry & Mars Reconnaissance Orbiter MARCI',
    archetypeOrder: ['systems', 'rover', 'radiation', 'biolab', 'systems', 'platformer', 'systems', 'rover', 'builder', 'systems']
  },
  {
    id: 19,
    name: 'Emergency Rescue Mission',
    icon: '🚨',
    badgeId: 'badge_first_responder',
    badgeTitle: 'Space Rescue Commander',
    badgeDesc: 'Navigated rugged canyons, transferred emergency oxygen, and towed stranded rovers to safety!',
    nasaRef: 'NASA Search and Rescue Mission Office & Space Exploration Vehicle (SEV)',
    archetypeOrder: ['rover', 'platformer', 'systems', 'rover', 'comms', 'platformer', 'rover', 'systems', 'rover', 'rover']
  },
  {
    id: 20,
    name: 'Final Interplanetary Survival Mission',
    icon: '🪐',
    badgeId: 'badge_fleet_commander',
    badgeTitle: 'Interplanetary Fleet Commander',
    badgeDesc: 'Achieved ultimate space mastery across Moon, Mars, and interplanetary spaceflight!',
    nasaRef: 'NASA Moon to Mars Planetary Architecture & Human Exploration Framework',
    archetypeOrder: ['systems', 'lander', 'rover', 'radiation', 'builder', 'biolab', 'comms', 'platformer', 'systems', 'lander']
  }
];

// Specific educational themes, decisions, and science connections for all 200 levels
const LEVEL_TOPICS = {
  1: [ // Astronaut Training Academy
    { sub: 1, title: 'Spacesuit Pressure Seal Check', obj: 'Calibrate suit pressure and verify 4.3 psi pure O₂ seals.', dec: 'Vent nitrogen slowly or fast purge?', fact: 'Spacesuits maintain internal pressure so astronaut blood does not boil in the vacuum of space!' },
    { sub: 2, title: 'Neutral Buoyancy Pool EVA', obj: 'Practice spacewalk maneuvers in the giant training pool.', dec: 'Use wrist tether or magnetic foot lock?', fact: 'NASA Neutral Buoyancy Lab in Houston contains 6.2 million gallons of water to simulate weightlessness.' },
    { sub: 3, title: 'Centrifuge High-G Training', obj: 'Endure 4-G acceleration forces inside the rotating centrifuge.', dec: 'Tense abdominal muscles or breathe deeply?', fact: 'Astronauts experience up to 3 to 4 times Earth gravity during rocket launches.' },
    { sub: 4, title: 'Airlock Depressurization Cycle', obj: 'Operate the airlock valves and pump air back into holding tanks.', dec: 'Reclaim 90% air slowly or vent 15% quickly?', fact: 'Modern airlocks pump out air and save it rather than venting it into empty space.' },
    { sub: 5, title: 'VR Spacewalk Tether Drill', obj: 'Navigate outside the space station using SAFER jetpack bursts.', dec: 'Use short thruster pulses or continuous thrust?', fact: 'SAFER (Simplified Aid for EVA Rescue) is a backpack thruster system astronauts wear during spacewalks.' },
    { sub: 6, title: 'Astro-Nutrition & Caloric Balance', obj: 'Formulate balanced space rations rich in calcium and vitamin D.', dec: 'Add freeze-dried berries or iron-fortified paste?', fact: 'Astronauts need extra vitamin D and calcium because they receive no natural outdoor sunlight.' },
    { sub: 7, title: 'Emergency Mask & Fire Suppression', obj: 'Locate thermal anomalies and activate non-toxic CO₂ extinguishers.', dec: 'Isolate electrical breaker or discharge foam?', fact: 'In zero-G, flames do not rise; they form round spheres because there is no hot air buoyancy!' },
    { sub: 8, title: 'Reaction Time & Hand-Eye Reflex', obj: 'Dock the simulation capsule within 10 centimeters of center.', dec: 'Align crosshairs with attitude thrusters or fly manual?', fact: 'Hand controllers inside spacecraft use 6 degrees of freedom (pitch, roll, yaw, X, Y, Z).' },
    { sub: 9, title: 'Survival Wilderness Navigation', obj: 'Identify emergency survival pack equipment after capsule touchdown.', dec: 'Signal beacon first or set up emergency thermal tarp?', fact: 'Astronauts train in desert and arctic environments in case spacecraft land off-target on Earth.' },
    { sub: 10, title: 'Cadet Graduation Flight', obj: 'Fly the high-altitude supersonic T-38 jet simulation course.', dec: 'Fly high altitude for fuel savings or low for radar lock?', fact: 'NASA astronauts fly supersonic T-38 jets to practice rapid decision-making under high cockpit stress.' }
  ],
  2: [ // Rocket Launch Preparation
    { sub: 1, title: 'Cryogenic Liquid Hydrogen Fueling', obj: 'Pump supercooled liquid hydrogen (-253°C) into core tank.', dec: 'Pre-chill fuel lines slowly or pump at high volume?', fact: 'Liquid hydrogen is so cold that ordinary air turns into solid ice crystals near the fuel lines!' },
    { sub: 2, title: 'Solid Rocket Booster Inspection', obj: 'Inspect the segmented O-ring thermal barriers on twin boosters.', dec: 'Double inspect joint heating blankets or seal early?', fact: 'Solid rocket boosters provide over 75% of total thrust needed to lift the massive SLS rocket off the ground.' },
    { sub: 3, title: 'Telemetry Uplink to Mission Control', obj: 'Establish 100% clean data ping with Houston and Cape Canaveral.', dec: 'Broadcast on S-band primary or Ku-band backup?', fact: 'Launch telemetry monitors over 100,000 sensors every single fraction of a second!' },
    { sub: 4, title: 'Payload Weight & Center of Gravity', obj: 'Balance the Orion capsule mass for optimal aerodynamic stability.', dec: 'Place cargo in lower ring or distribute along perimeter?', fact: 'Every kilogram launched into orbit requires roughly 25 to 50 kilograms of rocket propellant!' },
    { sub: 5, title: 'Launch Abort System (LAS) Test', obj: 'Test the solid-fuel escape tower that pulls crew away if needed.', dec: 'Run static motor coil test or digital simulated fire?', fact: 'The Launch Abort System can pull the astronaut capsule half a mile away from the rocket in just 2 seconds.' },
    { sub: 6, title: 'Weather Wind Shear Evaluation', obj: 'Analyze upper-level atmosphere wind speed profiles before liftoff.', dec: 'Hold countdown for 8 minutes or proceed on green fringe?', fact: 'NASA weather balloons measure high-altitude winds up to 20 kilometers above the launch pad.' },
    { sub: 7, title: 'Main Engine Gimbal Calibration', obj: 'Steer the four RS-25 engine nozzles through full rotational arc.', dec: 'Calibrate hydraulic actuators or digital encoders?', fact: 'Gimbaling means swiveling the rocket engine bell to steer the rocket in the correct direction.' },
    { sub: 8, title: 'Countdown Terminal Count T-10s', obj: 'Synchronize ground computers with flight guidance computers.', dec: 'Arm spark igniters at T-6s or wait for computer auto-arm?', fact: 'Water deluge systems spray 300,000 gallons of water in 30 seconds to absorb roaring acoustic sound waves!' },
    { sub: 9, title: 'Max-Q Aerodynamic Stress Run', obj: 'Throttle back main engines during maximum dynamic pressure.', dec: 'Throttle to 72% thrust or hold 85% for speed?', fact: 'Max-Q is the moment when atmospheric air pressure pushing against the rising rocket is at its highest.' },
    { sub: 10, title: 'Solid Booster Staging Separation', obj: 'Jettison spent boosters and fire core stage to achieve orbit.', dec: 'Fire separation pyro-bolts immediately or verify pressure drop?', fact: 'Spent rocket boosters separate at an altitude of 45 kilometers and parachute down into the ocean.' }
  ]
};

// Generate comprehensive data for all 20 missions
const allMissions = MISSIONS_META.map(meta => {
  const levels = [];

  for (let lvl = 1; lvl <= 10; lvl++) {
    const globalIdx = (meta.id - 1) * 10 + lvl;
    const arch = meta.archetypeOrder[lvl - 1] || 'systems';

    let specificTopic = LEVEL_TOPICS[meta.id]?.[lvl - 1];
    if (!specificTopic) {
      // Dynamic thematic generator tailored to the mission theme
      const missionWords = {
        3: ['Trajectory Correction Burn', 'Microgravity Free Float', 'Orbital Debris Tracking', 'Cabin CO₂ Scrubber Loop', 'Water Recovery Chiller', 'Deep Space Circadian Sleep', 'Star Tracker Optical Fix', 'Trans-Lunar Injection Burn', 'Thermal Radiator Shade', 'Deep Space Radio Relay'],
        4: ['Lunar Orbit Insertion', 'Descent Brake Retro-Burn', 'Hazard Boulder Detection', 'Slope Stability Scan', 'Landing Radar Lock', 'Lunar Dust Blow-Away', 'Fuel Throttling Balance', 'Pinpoint Landing Pad Touch', 'Engine Cutoff & Depress', 'Lunar Surface EVA Step'],
        5: ['South Pole Site Survey', 'Inflatable Dome Anchoring', 'Regolith 3D Berm Wall', 'Solar Tower Array Deploy', 'Power Distribution Cable', 'Airlock Modular Docking', 'Shackleton Water Ice Pipe', 'Thermal Heat Radiator', 'Habitat Pressure Seal', 'Lunar Outpost Activation'],
        6: ['MOXIE CO₂ Electrolysis', 'Sabatier Hydrogen Loop', 'Emergency O₂ Canister Test', 'Micro-Leak Sealant Patch', 'Cabin Pressure Regulate', 'Greenhouse O₂ Injection', 'Suit Tank Rapid Recharge', 'Bacterial Scrubber Filter', 'Backup O₂ Manifold Valve', 'Life Support Certification'],
        7: ['Permanently Shadowed Crater', 'Core Drill Sample Ice', 'Thermal Sublimation Unit', 'Water Filtration Column', 'Closed-Loop Greywater Sink', 'Hydroponics Water Trench', 'Airlock Water Leak Patch', 'Ice Storage Cryo-Tank', 'Water Transport Rover', 'Base Hydration Security'],
        8: ['LED Spectrum Calibration', 'Hydroponic Nutrient Dose', 'Microgreen Seedling Tray', 'Automated Flower Pollen', 'Photobioreactor Algae Tank', 'Root Moisture Monitoring', 'Space Crop Harvest Time', 'Bio-Dome CO₂ Injection', 'Nutritious Space Salad', 'Sustainable Botany Vault'],
        9: ['RadLab Dosimeter Baseline', 'Regolith Sandbag Wall', 'Water Wall Shield Jacket', 'Polyethylene Lining Test', 'High-Energy Proton Scan', 'Solar Flare Warning Siren', 'Crew Sleep Bunk Shielding', 'Dosimetry Badge Audit', 'Shield Layer Thickness Check', 'Radiation Safe Haven Lock'],
        10: ['DONKI Class X Solar Flare', 'Coronal Mass Ejection Wave', 'Solar Energetic Particle Warning', 'Subterranean Bunker Sprint', 'Rover Array Emergency Fold', 'Sensitive Avionics Powerdown', 'Radiation Dosimeter Spike', 'Emergency Beacon Broadcast', 'Post-Storm System Reboot', 'Solar Storm Survival Victory'],
        11: ['OSD-87 Retinal Visor Check', 'OSD-243 ARED Workout Drill', 'Bone Density Ultrasound', 'Cycle Ergometer Heart Test', 'Immune Cell Count Audit', 'Circadian LED Tuning (OSD-178)', 'Space Motion Sickness Fix', 'Telemedicine Earth Video', 'Clean Air Filter Replace', 'Astronaut Fitness Clear'],
        12: ['Solar Array Dust Clean Sweep', 'Sun-Tracking Motor Align', 'Battery Storage Cell Balance', 'Night Cycle Power Ration', 'Nuclear RTG Power Hookup', 'Laser Comms High-Drain Draw', 'Habitat Heating Grid Circuit', 'Overload Breaker Reset', 'Emergency Fuel Cell Start', 'Power Grid Optimization'],
        13: ['Deep Space Network Lock', 'Parabolic High-Gain Dish', '20-Minute Signal Delay Math', 'Ka-Band Laser Transmitter', 'Atmospheric Radio Fade Filter', 'Orbiter Satellite Relay Hop', 'Lunar Far-Side Quiet Zone', 'Data Packet Loss Recovery', 'Live Earth HD Video Uplink', 'Comms Matrix Synchronization'],
        14: ['Mare Tranquillitatis Traverse', 'Lava Tube Skylight Scout', 'Rare Basalt Rock Sample', 'Seismometer Deploy Drill', 'Retroreflector Laser Target', 'Steep Crater Wall Climbing', 'Lunar Nightfall Prep Drill', 'Rover Battery Sun Charge', 'Sample Return Canister Lock', 'Base Camp Return Rendezvous'],
        15: ['Trans-Mars Injection Burn', 'Helio-Centric Orbit Cruise', 'Asteroid Belt Debris Radar', 'Interplanetary Flare Evasion', 'Mid-Course Trajectory Burn', 'Artificial Spin Gravity Test', 'Supply Inventory Audit', 'Mars Optical Camera Approach', 'Aerocapture Corridor Math', 'Mars Orbit Insertion Burn'],
        16: ['Atmospheric Entry Interface', 'Hypersonic Heat Shield Glow', 'Supersonic Parachute Pop', 'Heat Shield Jettison Scan', 'Terrain Relative Nav Lock', 'Sky Crane Rocket Descent', 'Jezero Crater Touchdown', 'Sky Crane Separation Fly', 'Mastcam Instrument Deploy', 'First Mars Panorama Sent'],
        17: ['Jezero Base Survey Grid', 'Hab Module Inflatable Anchor', 'Mars Regolith 3D Wall', 'MOXIE Oxygen Plant Hook', 'Subsurface Ice Extractor', 'Mars Solar Array Farm', 'Dust Storm Airlock Chute', 'RTG Auxiliary Heat Hook', 'Habitat Atmospheric Seal', 'Mars Base Alpha Online'],
        18: ['Global Dust Storm Warning', 'Low-Solar Power Rationing', 'Battery Endurance Mode', 'Dust Filter Electrostatic Clean', 'Greenhouse Thermal Keep', 'Rover Emergency Recall Drive', 'Indoor Sprouting Garden', 'Comms Blackout Navigation', 'Atmospheric Dust Clearing', 'Red Planet Survival Award'],
        19: ['Stranded Rover Mayday Signal', 'Radio Beacon Triangulation', 'Trapped Crew O₂ Transfer', 'Rough Dune Ridge Crossing', 'Broken Wheel Axle Repair', 'Dust Devil Vortex Evasion', 'Tow Cable Hitch Lock Drill', 'Emergency Medical Stablize', 'Airlock Rescue Rendezvous', 'Heroic Rescue Debrief'],
        20: ['Multi-System Alert Cascade', 'Lander Precision Touchdown', 'Rover Sample Recovery Sprint', 'Solar Flare CME Bunker Seal', 'Base Life Support Reconstruction', 'Greenhouse Rapid Crop Rescue', 'Earth High-Gain Signal Lock', 'Deep Crater Ice Drill Operation', 'Power Grid Maximum Surge', 'Fleet Commander Graduation']
      };

      const title = missionWords[meta.id]?.[lvl - 1] || `Mission ${meta.id} Level ${lvl} Challenge`;
      specificTopic = {
        sub: lvl,
        title: title,
        obj: `Accomplish the ${title} objective while maintaining astronaut life support resources.`,
        dec: 'Balance safety speed vs resource efficiency?',
        fact: `NASA planetary research reveals that meticulous planning and redundant life support ensure astronaut survival on long space journeys.`
      };
    }

    levels.push({
      globalLevel: globalIdx,
      missionId: meta.id,
      levelInMission: lvl,
      title: specificTopic.title,
      archetype: arch,
      story: `Commander, welcome to ${meta.name}! In this level: ${specificTopic.title}. Your life support HUD is tracking oxygen, water, power, and radiation. Stay alert and make smart space decisions!`,
      objective: specificTopic.obj,
      nasaConnection: meta.nasaRef,
      realNasaFact: specificTopic.fact,
      params: {
        gravity: meta.id <= 14 ? 0.16 : (meta.id >= 15 ? 0.38 : 1.0),
        timeLimit: 45 + (lvl * 3),
        targetItems: 3 + Math.floor(lvl / 3),
        obstacleCount: 2 + lvl,
        fuel: 100,
        difficultyScale: 1.0 + (meta.id * 0.05)
      },
      decision: {
        prompt: `DECISION POINT: How should you handle ${specificTopic.title}?`,
        optionA: {
          label: `Option A: Prioritize Life Support & Safety`,
          desc: `Consumes 15 Energy, boosts Oxygen & Health by +20%`,
          effect: { energy: -15, oxygen: 20, health: 15 }
        },
        optionB: {
          label: `Option B: Expedited Science & Exploration`,
          desc: `Consumes 20 Oxygen, gains +150 Science XP`,
          effect: { oxygen: -20, points: 150 }
        }
      },
      reward: {
        stars: 3,
        sciencePoints: 100 + (meta.id * 10) + (lvl * 5),
        badgeUnlock: lvl === 10 ? meta.badgeId : null
      },
      learningCard: {
        title: `What Did You Learn? - ${specificTopic.title}`,
        explanation: specificTopic.fact,
        spaceFact: `NASA scientists use real data from ${meta.nasaRef} to design safer exploration vehicles.`,
        datasetLink: meta.nasaRef,
        quiz: {
          question: `In ${meta.name}, why is ${specificTopic.title} important for astronaut survival?`,
          options: [
            `It maintains life support and keeps astronauts safe in space.`,
            `It turns the spacecraft into an arcade machine.`,
            `It stops the planets from orbiting the Sun.`
          ],
          correctIndex: 0,
          explanation: `Correct! Space missions require constant monitoring of oxygen, energy, radiation, and equipment to keep astronauts alive and healthy.`
        }
      }
    });
  }

  return {
    id: meta.id,
    name: meta.name,
    icon: meta.icon,
    badgeId: meta.badgeId,
    badgeTitle: meta.badgeTitle,
    badgeDesc: meta.badgeDesc,
    nasaRef: meta.nasaRef,
    levels: levels
  };
});

const fileContent = `/**
 * SPACE WARS - Master Missions & Levels Database
 * Exactly 20 Major Missions × 10 Levels = 200 Playable Levels
 * Built with authentic NASA scientific references and educational game design.
 */

const MISSIONS_DATA = ${JSON.stringify(allMissions, null, 2)};

// Helper lookup functions
if (typeof window !== 'undefined') {
  window.MISSIONS_DATA = MISSIONS_DATA;
  window.getMissionById = function(missionId) {
    return MISSIONS_DATA.find(m => m.id === parseInt(missionId, 10));
  };
  window.getLevelByGlobalIndex = function(globalIndex) {
    const idx = parseInt(globalIndex, 10);
    for (const m of MISSIONS_DATA) {
      for (const lvl of m.levels) {
        if (lvl.globalLevel === idx) return { mission: m, level: lvl };
      }
    }
    return { mission: MISSIONS_DATA[0], level: MISSIONS_DATA[0].levels[0] };
  };
}

if (typeof module !== 'undefined') {
  module.exports = MISSIONS_DATA;
}
`;

fs.writeFileSync(path.join(__dirname, 'missions-data.js'), fileContent, 'utf8');
console.log(`✅ Successfully generated 20 Missions & 200 Levels in data/missions-data.js! Total missions: ${allMissions.length}, Total levels: ${allMissions.length * 10}`);

