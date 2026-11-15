/**
 * SPACE WARS - Master Missions & Levels Database
 * Exactly 7 Major Missions × 10 Levels = 70 Total Playable Levels
 * Built with authentic NASA scientific references and 100% pure playable gameplay.
 * ZERO QUESTIONS • ZERO QUIZZES • 100% ACTION GAMEPLAY
 */

const MISSIONS_DATA = [
  // =========================================================================
  // MISSION 1: ROCKET LAUNCH & SPACE TRAVEL (Levels 1 - 10)
  // =========================================================================
  {
    id: 1,
    name: "Rocket Launch & Space Travel",
    icon: "🚀",
    badgeId: "badge_rocket",
    badgeTitle: "Astronaut Flight Wings",
    badgeDesc: "Successfully prepared, launched, and navigated spacecraft through deep space to the destination!",
    nasaRef: "NASA Space Launch System (SLS) Artemis Flight Program & Kennedy Space Center Pad 39B",
    levels: [
      {
        globalLevel: 1,
        missionId: 1,
        levelInMission: 1,
        title: "Rocket Preparation & Equipment Loading",
        archetype: "rocket",
        subType: "payload",
        story: "Cadet, your Artemis mission is preparing for flight! Load essential cargo modules into the payload bay before closing the aerodynamic fairing.",
        objective: "Tap or drag 3 mission cargo modules (Supplies, Science Rack, CubeSat) into the rocket payload bay.",
        nasaConnection: "NASA SLS Payload Integration & Orion Multi-Purpose Crew Vehicle",
        realNasaFact: "The SLS payload fairing protects spacecraft and delicate scientific instruments from hypersonic wind forces during ascent.",
        params: { targetItems: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 2,
        missionId: 1,
        levelInMission: 2,
        title: "Fuel Tank Installation",
        archetype: "rocket",
        subType: "fuel_stage",
        story: "The massive core stage needs propellant! Align and lock the liquid hydrogen and liquid oxygen propellant stages into the booster frame.",
        objective: "Align the liquid oxygen and hydrogen propellant stages into the core rocket booster.",
        nasaConnection: "NASA Michoud Assembly Facility & Cryogenic Propellant Systems",
        realNasaFact: "Liquid hydrogen is chilled to -253°C (-423°F) and liquid oxygen to -183°C to store massive energy in minimal volume.",
        params: { targetItems: 2, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 3,
        missionId: 1,
        levelInMission: 3,
        title: "Rocket Launch Sequence",
        archetype: "rocket",
        subType: "launch_countdown",
        story: "T-minus 10 seconds! Fire the 4 RS-25 main engines and solid rocket boosters to achieve escape velocity.",
        objective: "Engage retro/main thrusters (Hold THRUST / Up / Space) to accelerate out of the atmosphere.",
        nasaConnection: "NASA Kennedy Space Center Launch Control Center Firing Room 1",
        realNasaFact: "The SLS core stage produces 2 million pounds of thrust from four RS-25 engines and two solid rocket boosters.",
        params: { targetAltitude: 300, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 4,
        missionId: 1,
        levelInMission: 4,
        title: "Rocket Steering & Navigation",
        archetype: "rocket",
        subType: "steering",
        story: "Ascending through max-Q! Steer lateral gimbals to guide the rocket smoothly through the atmospheric ascent corridor.",
        objective: "Use Left / Right steering controls to navigate through 3 orbital ascent corridor gates.",
        nasaConnection: "NASA Marshall Space Flight Center Launch Guidance & Navigation",
        realNasaFact: "Gimbaled engine nozzles pivot in fractions of a second to steer the rocket along its calculated orbital trajectory.",
        params: { targetGates: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 5,
        missionId: 1,
        levelInMission: 5,
        title: "Asteroid Avoidance",
        archetype: "rocket",
        subType: "asteroid_field",
        story: "Radar alert! A dense cluster of tumbling space rocks crosses your translunar trajectory. Maneuver to avoid impacts!",
        objective: "Evade tumbling asteroids using lateral thruster bursts while maintaining forward momentum.",
        nasaConnection: "NASA Planetary Defense Coordination Office & Near-Earth Object Observations",
        realNasaFact: "Space rocks travel at over 20,000 km/h; radar tracking and automated thruster bursts keep crew spacecraft safe.",
        params: { asteroidCount: 5, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 6,
        missionId: 1,
        levelInMission: 6,
        title: "Oxygen & Energy Collection",
        archetype: "rocket",
        subType: "orbital_collect",
        story: "Orbital transfer burn complete. Intercept and retrieve floating life support canisters to replenish cabin reserves.",
        objective: "Collect 3 floating resource canisters (Oxygen, Energy, Fuel) using gentle thruster maneuvers.",
        nasaConnection: "NASA Orbital Resupply Missions & ISS Automated Cargo Docking",
        realNasaFact: "Spacecraft use relative velocity matching to safely intercept supplies floating in free orbit.",
        params: { targetItems: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 7,
        missionId: 1,
        levelInMission: 7,
        title: "Engine Thrust & Fuel Management",
        archetype: "rocket",
        subType: "thrust_management",
        story: "Deep space trajectory correction! Perform controlled thruster burns without depleting fuel reserves.",
        objective: "Perform controlled thruster burns to maintain target speed corridor while conserving fuel.",
        nasaConnection: "NASA Glenn Research Center In-Space Propulsion Systems",
        realNasaFact: "Deep-space maneuvers calculate every gram of propellant using Newton's laws and orbital mechanics.",
        params: { targetBurns: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 8,
        missionId: 1,
        levelInMission: 8,
        title: "Space Debris Navigation",
        archetype: "rocket",
        subType: "space_debris",
        story: "Crossing low-orbit debris field! Pilot around defunct satellite fragments and fragmented rocket casings.",
        objective: "Navigate through high-speed orbital debris fragments to clear Earth departure orbit.",
        nasaConnection: "NASA Orbital Debris Program Office & Space Surveillance Network",
        realNasaFact: "Over 25,000 pieces of orbital debris larger than 10 cm are tracked continuously by ground radar.",
        params: { obstacleCount: 6, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 9,
        missionId: 1,
        levelInMission: 9,
        title: "Orbital Navigation & Waypoints",
        archetype: "rocket",
        subType: "orbital_navigation",
        story: "Trans-planetary injection! Align navigation vector with interplanetary waypoint beacons.",
        objective: "Fly through 3 orbital navigation waypoint gates to lock translunar insertion trajectory.",
        nasaConnection: "NASA Jet Propulsion Laboratory Deep Space Trajectory Design",
        realNasaFact: "Gravitational slingshots and precise orbital waypoints save up to 40% of spacecraft propellant.",
        params: { targetGates: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 10,
        missionId: 1,
        levelInMission: 10,
        title: "Reach the Moon or Mars Safely",
        archetype: "rocket",
        subType: "reach_destination",
        story: "Target planet in sight! Fire orbital insertion retro-thrusters to enter stable parking orbit around the Moon/Mars.",
        objective: "Perform orbital deceleration burn to enter safe destination parking orbit.",
        nasaConnection: "NASA Artemis Lunar Orbit Insertion & Mars Reconnaissance Orbiter Capture",
        realNasaFact: "Deceleration burns slow spacecraft from interplanetary cruise speeds so planetary gravity captures the vehicle.",
        params: { targetAltitude: 120, fuel: 100 },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 2: MOON / MARS LANDING (Levels 11 - 20)
  // =========================================================================
  {
    id: 2,
    name: "Moon / Mars Landing",
    icon: "🎯",
    badgeId: "badge_landing",
    badgeTitle: "Planetary Touchdown Badge",
    badgeDesc: "Successfully piloted lander through hazardous terrain and completed a safe soft touchdown!",
    nasaRef: "NASA Human Landing System (HLS), Apollo Lunar Module & Mars Curiosity/Perseverance EDL",
    levels: [
      {
        globalLevel: 11,
        missionId: 2,
        levelInMission: 1,
        title: "Planet Surface Observation",
        archetype: "landing",
        subType: "surface_observation",
        story: "Orbiting 50 km above the surface. Pan optical sensors across the planetary terrain to locate flat landing basins.",
        objective: "Pan surface recon sensors to observe and mark 3 geological basins on the planetary surface.",
        nasaConnection: "NASA Lunar Reconnaissance Orbiter Camera (LROC) & Mars HiRISE",
        realNasaFact: "NASA orbital cameras resolve surface boulders as small as a coffee table from 50 km in space.",
        params: { targetItems: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 12,
        missionId: 2,
        levelInMission: 2,
        title: "Terrain Scanning & Slope Analysis",
        archetype: "landing",
        subType: "terrain_scanning",
        story: "Initiating radar altimetry scan. Analyze slope gradients to find flat landing sectors with slope under 5 degrees.",
        objective: "Scan the landing terrain to identify and highlight safe flat zones (< 5° slope).",
        nasaConnection: "NASA Mars Global Surveyor Mars Orbiter Laser Altimeter (MOLA)",
        realNasaFact: "Landers can tip over if touching down on slopes steeper than 12 degrees; flat terrain is mandatory.",
        params: { targetScans: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 13,
        missionId: 2,
        levelInMission: 3,
        title: "Landing Location Exploration",
        archetype: "landing",
        subType: "recon_flight",
        story: "Deploy scout recon drone into the crater floor to confirm surface firmness and boulder clearances.",
        objective: "Fly scout drone across the terrain corridor to clear the primary landing site.",
        nasaConnection: "NASA Ingenuity Mars Helicopter Autonomous Aerial Scouting",
        realNasaFact: "Ingenuity completed over 70 autonomous flights on Mars, proving aerial scouting is invaluable for landers.",
        params: { targetGates: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 14,
        missionId: 2,
        levelInMission: 4,
        title: "Crater Avoidance",
        archetype: "landing",
        subType: "crater_avoidance",
        story: "Descent engine burning! Steer lander away from hazardous jagged impact craters towards clear ground.",
        objective: "Maneuver descending lander away from jagged crater hazards using lateral thruster bursts.",
        nasaConnection: "NASA Terrain-Relative Navigation (TRN) Lander Systems",
        realNasaFact: "Perseverance used Terrain-Relative Navigation to look at surface images and divert away from hazards automatically.",
        params: { hazardCount: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 15,
        missionId: 2,
        levelInMission: 5,
        title: "Landing Route Planning & Movement",
        archetype: "landing",
        subType: "route_planning",
        story: "Final descent corridor engaged. Guide the lander through 3 descent flight waypoints.",
        objective: "Fly through 3 altitude flight waypoints to establish the safe final descent corridor.",
        nasaConnection: "NASA Apollo Lunar Descent Guidance Computer (AGC)",
        realNasaFact: "Apollo astronauts manually redesignated landing coordinates to avoid boulder fields during the final descent.",
        params: { targetGates: 3, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 16,
        missionId: 2,
        levelInMission: 6,
        title: "Descent Speed Control",
        archetype: "landing",
        subType: "descent_control",
        story: "Altimeter 80 meters! Modulate main retro-thrusters to keep vertical descent speed below 2.5 m/s.",
        objective: "Maintain descent velocity under 2.5 m/s using throttled retro-thruster bursts.",
        nasaConnection: "NASA Terminal Descent Sensor (TDS) Radar Systems",
        realNasaFact: "Impact velocities greater than 3 m/s risk crushing lander shock absorbers and puncturing propellant tanks.",
        params: { maxSpeed: 125, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 17,
        missionId: 2,
        levelInMission: 7,
        title: "Thruster Balance in Low Gravity",
        archetype: "landing",
        subType: "thruster_balance",
        story: "Gravity is only 1/6th of Earth on the Moon (38% on Mars). Balance left and right reaction thrusters to stay level.",
        objective: "Keep lander attitude level (pitch < 15°) while hovering down toward the surface.",
        nasaConnection: "NASA Reaction Control System (RCS) Quad Thruster Assemblies",
        realNasaFact: "Pulsing reaction thrusters in low gravity requires gentle taps because there is no air to damp rotation.",
        params: { maxAngle: 0.35, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 18,
        missionId: 2,
        levelInMission: 8,
        title: "Wind & Terrain Hazard Simulation",
        archetype: "landing",
        subType: "wind_hazard",
        story: "Crosswind detected in Martian atmosphere! Counteract atmospheric gusts while descending over uneven dunes.",
        objective: "Counteract crosswind drift using lateral thrusters to stay centered over the landing corridor.",
        nasaConnection: "NASA Mars Environmental Dynamics Analyzer (MEDA) Wind Sensors",
        realNasaFact: "Although Mars air is 100 times thinner than Earth, 100 km/h dust gusts exert real lateral forces on descent craft.",
        params: { windGusts: true, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 19,
        missionId: 2,
        levelInMission: 9,
        title: "Landing Platform Alignment",
        archetype: "landing",
        subType: "platform_alignment",
        story: "Touchdown pad beacon locked! Center lander landing gear directly over the glowing landing target.",
        objective: "Align lander horizontal position directly over the designated landing pad beacon.",
        nasaConnection: "NASA Autonomous Precision Landing & Hazard Mitigation (ALHAT)",
        realNasaFact: "Precision landing within 50 meters of target surface assets is essential for establishing permanent base hubs.",
        params: { padTolerance: 50, fuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 20,
        missionId: 2,
        levelInMission: 10,
        title: "Complete a Safe Planetary Landing",
        archetype: "landing",
        subType: "touchdown_safe",
        story: "10 meters... 5 meters... Contact light! Complete a gentle touchdown below 2.5 m/s on the landing pad.",
        objective: "Touch down safely on the landing pad with speed under 2.5 m/s. Cut engines on contact!",
        nasaConnection: "NASA Artemis Starship HLS & Apollo 11 Lunar Landing",
        realNasaFact: "'Houston, Tranquility Base here. The Eagle has landed.' Safe landing marks the beginning of surface exploration!",
        params: { maxSpeed: 125, fuel: 100 },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 3: BUILD A SPACE STATION (Levels 21 - 30)
  // =========================================================================
  {
    id: 3,
    name: "Build a Space Station",
    icon: "🏰",
    badgeId: "badge_station",
    badgeTitle: "Master Station Architect",
    badgeDesc: "Constructed, connected, shielded, and activated a permanent modular planetary habitat!",
    nasaRef: "NASA Gateway Lunar Space Station & International Space Station (ISS) Modular Assembly",
    levels: [
      {
        globalLevel: 21,
        missionId: 3,
        levelInMission: 1,
        title: "Select Station Location & Anchor Base",
        archetype: "station",
        subType: "site_survey",
        story: "Survey orbital coordinates and anchor the central docking node node to establish base foundation.",
        objective: "Place the Central Node module onto the primary station construction grid.",
        nasaConnection: "NASA Gateway Power & Propulsion Element (PPE) & HALO Node",
        realNasaFact: "The central node provides power, data, and docking ports for all future international modules.",
        params: { requiredModules: ['node'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 22,
        missionId: 3,
        levelInMission: 2,
        title: "Collect Construction Materials",
        archetype: "station",
        subType: "collect_materials",
        story: "Cargo freighter arrived with titanium structural struts! Use the robotic arm to collect construction struts floating in orbit.",
        objective: "Operate cargo grapple arm to collect 3 floating structural truss materials.",
        nasaConnection: "NASA Canadarm2 Robotic Manipulator System",
        realNasaFact: "Canadarm2 walked end-over-end across the station exterior to assemble over 400 tons of ISS modules.",
        params: { targetItems: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 23,
        missionId: 3,
        levelInMission: 3,
        title: "Build the Main Habitat",
        archetype: "station",
        subType: "main_habitat",
        story: "Dock the pressurized central Habitat Core module to provide breathable living volume for the crew.",
        objective: "Dock and seal the main Habitat Core module to the central station node.",
        nasaConnection: "NASA TransHab Inflatable Habitat Technology & Bigelow BEAM",
        realNasaFact: "Inflatable habitats pack into compact rocket fairings and expand in orbit with layered Kevlar micrometeorite shields.",
        params: { requiredModules: ['hab'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 24,
        missionId: 3,
        levelInMission: 4,
        title: "Install Sleeping & Living Modules",
        archetype: "station",
        subType: "living_quarters",
        story: "Crew welfare is vital! Install crew sleep quarters, personal hygiene compartments, and dining galley.",
        objective: "Add the Crew Quarters module to the station docking grid.",
        nasaConnection: "NASA ISS Harmony (Node 2) Crew Sleep Stations",
        realNasaFact: "Astronauts sleep inside padded sleeping bags tied to the wall to keep from floating into equipment during sleep.",
        params: { requiredModules: ['hab', 'living'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 25,
        missionId: 3,
        levelInMission: 5,
        title: "Build a Science Laboratory",
        archetype: "station",
        subType: "science_lab",
        story: "Science is the mission! Install the zero-gravity scientific research and biology laboratory module.",
        objective: "Place and lock the Science Research Lab module into the station grid.",
        nasaConnection: "NASA Destiny U.S. National Laboratory & ESA Columbus",
        realNasaFact: "Space laboratories host hundreds of simultaneous experiments in drug development, crystal growth, and astrophysics.",
        params: { requiredModules: ['hab', 'lab'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 26,
        missionId: 3,
        levelInMission: 6,
        title: "Build a Storage Facility",
        archetype: "station",
        subType: "storage_facility",
        story: "Supplies for a 2-year mission require volume. Attach the pressurized logistics storage facility.",
        objective: "Attach the Logistics Storage Facility module to store water, food, and spare parts.",
        nasaConnection: "NASA Leonardo Permanent Multipurpose Module (PMM)",
        realNasaFact: "Storage modules hold thousands of standardized cargo transfer bags organized using RFID barcode tracking.",
        params: { requiredModules: ['hab', 'storage'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 27,
        missionId: 3,
        levelInMission: 7,
        title: "Install Communication Equipment",
        archetype: "station",
        subType: "comms_mount",
        story: "Mount high-gain parabolic antenna array to maintain 24/7 telemetry links with Earth ground stations.",
        objective: "Mount and calibrate the High-Gain Comms Dish module on the station exterior truss.",
        nasaConnection: "NASA Space Network & Tracking and Data Relay Satellite (TDRS)",
        realNasaFact: "TDRS satellites in geosynchronous orbit provide continuous high-speed broadband telemetry between station and ground.",
        params: { requiredModules: ['hab', 'comms'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 28,
        missionId: 3,
        levelInMission: 8,
        title: "Install Protective Shielding",
        archetype: "station",
        subType: "protective_shield",
        story: "Deep space poses micrometeorite and radiation risks. Cover habitat domes with regolith armor shields.",
        objective: "Install 2 Radiation & Micrometeorite Berm Shield modules over crew habitats.",
        nasaConnection: "NASA Whipple Shielding & Regolith Radiation Protective Systems",
        realNasaFact: "Whipple shields use spaced bumper sheets that vaporize incoming hypervelocity space pebbles before reaching the hull.",
        params: { requiredModules: ['hab', 'shield'] },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 29,
        missionId: 3,
        levelInMission: 9,
        title: "Connect Station Modules",
        archetype: "station",
        subType: "connect_modules",
        story: "Interconnect all modules with utility umbilical corridors carrying power cables, air ducts, and data lines.",
        objective: "Connect all installed modules with transit and utility corridors.",
        nasaConnection: "NASA Common Berthing Mechanism (CBM) & Vestibule Outfitting",
        realNasaFact: "Between docked modules, astronauts install electrical jumpers, fluid lines, and ventilation ducts across the hatch vestibule.",
        params: { minPlaced: 5 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 30,
        missionId: 3,
        levelInMission: 10,
        title: "Complete & Activate the Space Station",
        archetype: "station",
        subType: "station_activation",
        story: "Assembly complete! Pressurize corridors, engage primary life support, and power on the station core.",
        objective: "Pressurize all modules and engage the master station activation switch.",
        nasaConnection: "NASA Gateway Inauguration & ISS Expedition 1 Commissioning",
        realNasaFact: "Humanity has maintained continuous human presence in space since November 2, 2000!",
        params: { minPlaced: 6 },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 4: GENERATE ELECTRICITY (Levels 31 - 40)
  // =========================================================================
  {
    id: 4,
    name: "Generate Electricity",
    icon: "⚡",
    badgeId: "badge_power",
    badgeTitle: "Power Grid Engineer",
    badgeDesc: "Installed solar panels, managed battery storage, balanced loads, and stabilized station electrical grid!",
    nasaRef: "NASA Glenn Research Center Space Power Systems & ISS Solar Array Wings (SAW)",
    levels: [
      {
        globalLevel: 31,
        missionId: 4,
        levelInMission: 1,
        title: "Install Solar Panels",
        archetype: "power",
        subType: "install_panels",
        story: "Mount photovoltaic solar array wings onto the main station exterior truss.",
        objective: "Deploy and secure 2 Photovoltaic Solar Array wings onto the power truss.",
        nasaConnection: "NASA ISS Roll-Out Solar Arrays (iROSA)",
        realNasaFact: "iROSA solar arrays roll out like tape measures using stored kinetic strain energy, generating up to 120 kW of clean electricity.",
        params: { targetPanels: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 32,
        missionId: 4,
        levelInMission: 2,
        title: "Position Solar Panels Towards Sunlight",
        archetype: "power",
        subType: "sun_tracking",
        story: "Maximize energy generation! Rotate solar array gimbal to track the sun directly for maximum wattage.",
        objective: "Rotate solar panel azimuth angle to match peak sunlight angle (100% sunlight alignment).",
        nasaConnection: "NASA Solar Alpha Rotary Joint (SARJ) Continuous Sun-Tracking",
        realNasaFact: "The SARJ 10-foot diameter joint rotates 360 degrees every 90 minutes to keep panels pointing straight at the Sun.",
        params: { targetAngle: 90 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 33,
        missionId: 4,
        levelInMission: 3,
        title: "Connect Electrical Cables",
        archetype: "power",
        subType: "cable_routing",
        story: "Route heavy 120-volt DC power cables from solar arrays into the main power junction distribution box.",
        objective: "Connect electrical conduit cables from solar arrays to the central distribution bus.",
        nasaConnection: "NASA Main Bus Switching Units (MBSU)",
        realNasaFact: "The station electrical bus operates at 120 volts DC to minimize copper cable mass while delivering high current.",
        params: { targetCables: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 34,
        missionId: 4,
        levelInMission: 4,
        title: "Install Storage Batteries",
        archetype: "power",
        subType: "install_batteries",
        story: "During the 35-minute orbital night, solar panels produce zero power! Install lithium-ion battery storage cells.",
        objective: "Install 4 Lithium-Ion Battery storage cells into the primary power rack.",
        nasaConnection: "NASA Lithium-Ion Orbital Replacement Unit (ORU) Battery Upgrades",
        realNasaFact: "NASA replaced 48 old nickel-hydrogen batteries with 24 modern lithium-ion batteries, doubling energy storage density.",
        params: { targetBatteries: 4 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 35,
        missionId: 4,
        levelInMission: 5,
        title: "Generate Electricity in Sunlight",
        archetype: "power",
        subType: "generate_power",
        story: "Sunlight is striking the photovoltaic cells! Monitor solar power generation climbing to +80 kW.",
        objective: "Maintain active solar tracking until power generation accumulates to +80 kW.",
        nasaConnection: "NASA Solar Photovoltaic Cell Efficiency Research",
        realNasaFact: "Gallium arsenide multi-junction solar cells convert over 32% of incoming solar photons into usable electricity.",
        params: { targetKW: 80 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 36,
        missionId: 4,
        levelInMission: 6,
        title: "Store Excess Energy",
        archetype: "power",
        subType: "energy_storage",
        story: "Generate and store excess power into battery reserves to reach 100% state of charge before entering eclipse.",
        objective: "Charge the battery bank storage to 100% capacity before orbital sunset.",
        nasaConnection: "NASA Battery Charge/Discharge Units (BCDU)",
        realNasaFact: "Smart charge controllers prevent lithium-ion cells from overheating or overcharging in vacuum conditions.",
        params: { targetCharge: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 37,
        missionId: 4,
        levelInMission: 7,
        title: "Distribute Electricity Across Modules",
        archetype: "power",
        subType: "power_distribution",
        story: "Energize module power feeds! Route separate electrical channels to Habitat, Science Lab, and Life Support.",
        objective: "Toggle power distribution breakers to supply electrical power to all 3 station sectors.",
        nasaConnection: "NASA Remote Power Controller Modules (RPCM)",
        realNasaFact: "Solid-state electronic circuit breakers trip in milliseconds if an unexpected power surge or short occurs.",
        params: { targetChannels: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 38,
        missionId: 4,
        levelInMission: 8,
        title: "Manage Power Consumption (Eclipse Load Shedding)",
        archetype: "power",
        subType: "load_shedding",
        story: "Station enters planetary shadow! Total power draw exceeds battery discharge limit. Shed non-essential loads!",
        objective: "Turn off non-essential systems to reduce power draw under the safe 60 kW limit.",
        nasaConnection: "NASA Mission Control Houston SPARTAN Flight Control Console",
        realNasaFact: "SPARTAN controllers continuously balance power consumption so life support batteries never drop below 70% during eclipse.",
        params: { capacityLimit: 60 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 39,
        missionId: 4,
        levelInMission: 9,
        title: "Repair Damaged Electrical Connection",
        archetype: "power",
        subType: "repair_connection",
        story: "Electrical short detected on exterior array truss! Bypass damaged wire conduit and reconnect backup circuit.",
        objective: "Locate and reconnect the broken electrical junction conduit to restore power flow.",
        nasaConnection: "NASA Spacewalk EVA Power Cable Bypass Operations",
        realNasaFact: "Spacewalking astronauts use specialized insulated torque tools to safely bypass and repair 120V power conduits.",
        params: { targetRepairs: 1 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 40,
        missionId: 4,
        levelInMission: 10,
        title: "Activate Complete Station Power Grid",
        archetype: "power",
        subType: "grid_activation",
        story: "All solar panels, battery banks, and circuits ready. Balance all switches and engage master power grid!",
        objective: "Balance power consumption under 60 kW with Life Support online and engage Master Power Grid.",
        nasaConnection: "NASA Electric Power System (EPS) Final Commissioning",
        realNasaFact: "A stabilized space station power grid powers life-saving oxygen scrubbers, computers, and science experiments 24/7!",
        params: { capacityLimit: 60 },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 5: OXYGEN & LIFE SUPPORT (Levels 41 - 50)
  // =========================================================================
  {
    id: 5,
    name: "Oxygen & Life Support",
    icon: "🫧",
    badgeId: "badge_eclss",
    badgeTitle: "Life Support Specialist",
    badgeDesc: "Built oxygen generators, repaired pressurized pipes, filled spacesuits, and mastered ECLSS survival!",
    nasaRef: "NASA Environmental Control and Life Support System (ECLSS) & Mars MOXIE Experiment",
    levels: [
      {
        globalLevel: 41,
        missionId: 5,
        levelInMission: 1,
        title: "Build the Oxygen-Generation System",
        archetype: "eclss",
        subType: "build_oxygen_plant",
        story: "Install the catalytic oxygen-generation MOXIE reactor inside the Environmental Control bay.",
        objective: "Position and secure the MOXIE Oxygen Generator unit into the ECLSS rack.",
        nasaConnection: "NASA Mars 2020 MOXIE (Mars Oxygen ISRU Experiment)",
        realNasaFact: "MOXIE proved that future human missions can generate 100% of their breathable oxygen directly from Martian CO2!",
        params: { targetItems: 1 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 42,
        missionId: 5,
        levelInMission: 2,
        title: "Collect Required Resources (Water Ice & CO2)",
        archetype: "eclss",
        subType: "collect_resources",
        story: "Oxygen generation requires raw materials! Collect 3 water ice / CO2 canisters to feed the electrolysis reactor.",
        objective: "Collect 3 resource feedstock canisters to supply the oxygen processor.",
        nasaConnection: "NASA In-Situ Resource Utilization (ISRU) Technology",
        realNasaFact: "Harvesting local resources on the Moon and Mars saves launching thousands of kilograms of water from Earth.",
        params: { targetItems: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 43,
        missionId: 5,
        levelInMission: 3,
        title: "Activate Oxygen Production",
        archetype: "eclss",
        subType: "activate_moxie",
        story: "Heat MOXIE solid oxide electrolysis cell to 800°C to split carbon dioxide molecules into breathable O2.",
        objective: "Engage reactor heaters and activate oxygen electrolysis production.",
        nasaConnection: "NASA Solid Oxide Electrolysis Cell (SOEC) Technology",
        realNasaFact: "Electrolysis uses electricity to rip oxygen atoms away from carbon atoms, producing pure breathable oxygen.",
        params: { targetTemp: 800 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 44,
        missionId: 5,
        levelInMission: 4,
        title: "Connect Oxygen Storage Tanks",
        archetype: "eclss",
        subType: "connect_tanks",
        story: "Generated oxygen must be stored at high pressure. Plumb high-pressure valves to the central storage tank manifold.",
        objective: "Connect high-pressure oxygen delivery lines into the main storage tank manifold.",
        nasaConnection: "NASA High-Pressure Composite Overwrapped Pressure Vessels (COPV)",
        realNasaFact: "Carbon-fiber wound tanks store pure oxygen at over 3,000 pounds per square inch.",
        params: { targetLines: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 45,
        missionId: 5,
        levelInMission: 5,
        title: "Maintain Air Circulation & CO2 Scrubbing",
        archetype: "eclss",
        subType: "air_circulation",
        story: "Without gravity, warm air does not rise! Adjust cabin circulation fans to prevent CO2 pockets from suffocating sleeping crew.",
        objective: "Adjust ventilation fans and activate Carbon Dioxide Scrubbers (CDRA).",
        nasaConnection: "NASA Carbon Dioxide Removal Assembly (CDRA) & Amine Scrubbers",
        realNasaFact: "Without ventilation fans in microgravity, an astronaut would suffocate in a cloud of their own exhaled carbon dioxide!",
        params: { targetFans: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 46,
        missionId: 5,
        levelInMission: 6,
        title: "Monitor Oxygen Levels & Consumption",
        archetype: "eclss",
        subType: "monitor_o2",
        story: "Humans consume 0.84 kg of oxygen daily. Balance oxygen output against astronaut metabolic consumption.",
        objective: "Maintain cabin oxygen percentage between 20.5% and 21.5% under active crew metabolic draw.",
        nasaConnection: "NASA Major Constituent Analyzer (MCA) Mass Spectrometer",
        realNasaFact: "The MCA mass spectrometer samples cabin air every 30 seconds to track nitrogen, oxygen, and trace gases.",
        params: { targetPPM: 21 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 47,
        missionId: 5,
        levelInMission: 7,
        title: "Repair a Leaking Oxygen Pipe",
        archetype: "eclss",
        subType: "repair_leak",
        story: "PRESSURE ALARM! A micrometeorite punctured an external oxygen delivery pipe. Locate and seal the breach fast!",
        objective: "Apply emergency vacuum sealant patch to the leaking oxygen pipe before pressure drops to zero.",
        nasaConnection: "NASA Emergency Depressurization Procedures & Ultrasonic Leak Detectors",
        realNasaFact: "Astronauts use sensitive ultrasonic listening devices to hear the hiss of air escaping through tiny cracks into vacuum.",
        params: { timeLimit: 30 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 48,
        missionId: 5,
        levelInMission: 8,
        title: "Prepare Astronaut Spacesuits",
        archetype: "eclss",
        subType: "spacesuit_prep",
        story: "Spacewalk preparation! Check spacesuit Primary Life Support System (PLSS) backpack seals and water cooling loop.",
        objective: "Inspect spacesuit pressure seals, helmet visor locks, and oxygen regulator valves.",
        nasaConnection: "NASA Exploration Extravehicular Mobility Unit (xEMU)",
        realNasaFact: "Spacesuit backpacks contain tiny versions of all station life support systems: oxygen tanks, CO2 scrubbers, and water pumps.",
        params: { targetChecks: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 49,
        missionId: 5,
        levelInMission: 9,
        title: "Refill Oxygen Before Exploration",
        archetype: "eclss",
        subType: "refill_suit",
        story: "Never explore space without full tanks! Dock spacesuit to the recharge manifold and charge oxygen tanks to 100%.",
        objective: "Connect spacesuit to recharge port and fill suit oxygen reserves to 100%.",
        nasaConnection: "NASA Airlock High-Pressure Gas Recharge Operations",
        realNasaFact: "Astronauts always perform a 4-hour pre-breathe protocol with pure oxygen to prevent decompression sickness (the bends).",
        params: { targetOxygen: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 50,
        missionId: 5,
        levelInMission: 10,
        title: "Complete Full Life-Support System Test",
        archetype: "eclss",
        subType: "eclss_activation",
        story: "All systems online! Verify oxygen generators, pressure regulators, and air scrubbers certify all-green status.",
        objective: "Verify all ECLSS vitals are green and certify the life support system for mission operations.",
        nasaConnection: "NASA Human Exploration Operations Mission Directorate Life Support Certification",
        realNasaFact: "ISS ECLSS recycles over 98% of all water and oxygen on board, enabling humans to live in space indefinitely!",
        params: { minVitals: 95 },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 6: RADIATION MONITORING & SPACEWALK (Levels 51 - 60)
  // =========================================================================
  {
    id: 6,
    name: "Radiation Monitoring & Spacewalk",
    icon: "☢️",
    badgeId: "badge_spacewalk",
    badgeTitle: "Golden EVA Spacewalker",
    badgeDesc: "Mastered low-G surface exploration, monitored dosimeter radiation, and survived Class X solar storms!",
    nasaRef: "NASA Space Radiation Analysis Group (SRAG), RadLab Telemetry & DONKI Space Weather Alerts",
    levels: [
      {
        globalLevel: 51,
        missionId: 6,
        levelInMission: 1,
        title: "Prepare the Astronaut Spacesuit",
        archetype: "spacewalk",
        subType: "suit_inspection",
        story: "Equip the heavy radiation-shielded spacesuit with gold-coated solar reflection visor before stepping into open space.",
        objective: "Inspect spacesuit radiation shielding and verify gold visor attenuation.",
        nasaConnection: "NASA Extravehicular Mobility Unit Thermal & Micrometeorite Garment (TMG)",
        realNasaFact: "A microscopic thin layer of pure 24-karat gold on spacesuit visors reflects blinding solar glare and dangerous infrared heat.",
        params: { targetChecks: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 52,
        missionId: 6,
        levelInMission: 2,
        title: "Check the Radiation Monitor",
        archetype: "spacewalk",
        subType: "dosimeter_calibrate",
        story: "Calibrate the RadLab personal radiation dosimeter. Establish baseline cosmic ray background dosage.",
        objective: "Calibrate personal dosimeter and record baseline background radiation dose rate.",
        nasaConnection: "NASA RadLab ISS Active Tissue Equivalent Dosimeter Telemetry",
        realNasaFact: "Astronauts wear active dosimeters 24 hours a day to track cumulative exposure from galactic cosmic rays and solar particles.",
        params: { targetDoseRate: 0.22 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 53,
        missionId: 6,
        levelInMission: 3,
        title: "Exit the Station Safely",
        archetype: "spacewalk",
        subType: "airlock_exit",
        story: "Depressurize the airlock chamber. Open outer hatch and step out onto the planetary surface.",
        objective: "Depressurize airlock, cycle the outer hatch open, and egress safely into open space.",
        nasaConnection: "NASA Quest Airlock Operations & Joint Airlock Egress Protocols",
        realNasaFact: "Airlock depressurization pumps air back into storage tanks so virtually no precious cabin air is lost to space.",
        params: { airlockOpen: true },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 54,
        missionId: 6,
        levelInMission: 4,
        title: "Explore the Planetary Surface",
        archetype: "spacewalk",
        subType: "surface_traverse",
        story: "Navigate the astronaut across low-gravity planetary surface ledges using jetpack thruster bursts.",
        objective: "Walk and jump across 3 geological surface ledges using low-G jump and jetpack bursts.",
        nasaConnection: "NASA Apollo EVA Surface Exploration & Artemis Lunar Terrain Traverse",
        realNasaFact: "In 1/6th gravity, astronauts used a two-footed 'bunny hop' technique to move efficiently across loose lunar dirt.",
        params: { targetLedges: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 55,
        missionId: 6,
        levelInMission: 5,
        title: "Collect Objects During Spacewalk",
        archetype: "spacewalk",
        subType: "spacewalk_collect",
        story: "Inspect station exterior and collect 3 essential geological samples and repair tools during EVA.",
        objective: "Collect 3 objects (Water Ice Core, Hematite Blueberry, EVA Repair Tool) while managing suit oxygen.",
        nasaConnection: "NASA EVA Geological Tool Carrier & Sample Return Containers",
        realNasaFact: "Apollo astronauts collected over 382 kilograms of lunar rocks, core tubes, and soil samples during spacewalks.",
        params: { targetItems: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 56,
        missionId: 6,
        levelInMission: 6,
        title: "Monitor Radiation Exposure",
        archetype: "spacewalk",
        subType: "dosimeter_monitoring",
        story: "Cosmic rays penetrate spacesuits continuously. Monitor dosimeter rate meter during extended surface EVA.",
        objective: "Keep cumulative radiation dose below safety limit while exploring open terrain.",
        nasaConnection: "NASA RadLab ISS Dosimeter Telemetry & Absorbed Dose Rates",
        realNasaFact: "Without Earth's magnetic field and thick atmosphere, astronauts receive 20 to 50 times more radiation than people on Earth.",
        params: { maxRadiation: 160 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 57,
        missionId: 6,
        levelInMission: 7,
        title: "Detect Approaching Solar Storm",
        archetype: "spacewalk",
        subType: "solar_flare_alert",
        story: "SIREN WARNING! NASA DONKI detects an erupting Class X8.7 solar flare heading straight toward your location!",
        objective: "Acknowledge solar storm warning siren and initiate immediate emergency evacuation protocol.",
        nasaConnection: "NASA DONKI Space Weather Notifications & NOAA Space Weather Prediction Center",
        realNasaFact: "Solar energetic proton storms travel at nearly light speed, giving astronauts as little as 15 to 30 minutes to seek shelter.",
        params: { flareClass: "X8.7", countdown: 25 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 58,
        missionId: 6,
        levelInMission: 8,
        title: "Find the Protected Shelter",
        archetype: "spacewalk",
        subType: "bunker_evacuation",
        story: "High-energy protons arriving! Race across surface obstacles to locate the subterranean regolith storm bunker entrance.",
        objective: "Navigate terrain to find and reach the entrance of the underground regolith storm shelter.",
        nasaConnection: "NASA Lunar & Martian Regolith In-Situ Radiation Shielding Studies",
        realNasaFact: "Two meters of compacted Moon/Mars soil (regolith) absorbs over 95% of cosmic rays and dangerous solar protons.",
        params: { countdown: 25 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 59,
        missionId: 6,
        levelInMission: 9,
        title: "Take Shelter in Storm Bunker",
        archetype: "spacewalk",
        subType: "storm_shelter",
        story: "Enter the storm bunker, seal the lead-lined hatch, and activate water wall shields before timer expires.",
        objective: "Enter the storm bunker and seal hatch before the solar storm countdown reaches zero.",
        nasaConnection: "NASA Artemis Storm Shelter Water Wall Shielding Architecture",
        realNasaFact: "Water is rich in hydrogen atoms, making water storage tanks the most effective radiation barrier known to space engineers.",
        params: { countdown: 25 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 60,
        missionId: 6,
        levelInMission: 10,
        title: "Complete Radiation-Safe EVA Mission",
        archetype: "spacewalk",
        subType: "return_airlock",
        story: "Solar storm subsided! Safely return to the station airlock, seal inner hatch, and complete the radiation-safe EVA.",
        objective: "Return to the station airlock, seal the hatch, and complete mission decontamination.",
        nasaConnection: "NASA Space Radiation Health Operations & Post-EVA Protocols",
        realNasaFact: "Careful monitoring and shelter protocols allow space explorers to explore deep space and return safely home!",
        params: { airlockClosed: true },
        reward: { stars: 3, sciencePoints: 150 }
      }
    ]
  },

  // =========================================================================
  // MISSION 7: MARS / MOON RESEARCH & RETURN TO EARTH (Levels 61 - 70)
  // =========================================================================
  {
    id: 7,
    name: "Mars / Moon Research & Return to Earth",
    icon: "🔬",
    badgeId: "badge_research",
    badgeTitle: "Interplanetary Pioneer",
    badgeDesc: "Drove research rovers, drilled core samples, beamed data to Earth, and landed safely back on Earth!",
    nasaRef: "NASA Mars 2020 Perseverance Rover, Deep Space Network (DSN) & Artemis Earth Return",
    levels: [
      {
        globalLevel: 61,
        missionId: 7,
        levelInMission: 1,
        title: "Activate the Research Rover",
        archetype: "research",
        subType: "boot_rover",
        story: "Power on the six-wheel drive research rover! Test rocker-bogie suspension and calibrate drive steering motors.",
        objective: "Activate rover systems, verify 100% battery, and test forward drive controls.",
        nasaConnection: "NASA Jet Propulsion Laboratory Rocker-Bogie Rover Mobility System",
        realNasaFact: "The rocker-bogie suspension allows rovers to climb over rocks twice the diameter of their wheels without tipping over.",
        params: { targetSpeed: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 62,
        missionId: 7,
        levelInMission: 2,
        title: "Explore Planetary Terrain",
        archetype: "research",
        subType: "crater_exploration",
        story: "Drive the rover across Jezero Crater delta dunes, steering around dangerous boulders and soft sand traps.",
        objective: "Drive rover across surface terrain past boulder obstacles toward the research waypoint.",
        nasaConnection: "NASA Mars Trek Cartography & Jezero Crater Delta Traverse",
        realNasaFact: "Perseverance drove over 20 kilometers exploring ancient river delta rocks that were once submerged in water.",
        params: { targetDistance: 500 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 63,
        missionId: 7,
        levelInMission: 3,
        title: "Collect Rock Samples",
        archetype: "research",
        subType: "rock_collection",
        story: "Deploy robotic arm scoop to collect surface sedimentary rocks and volcanic basalt mineral samples.",
        objective: "Deploy rover robotic scoop arm to collect 2 surface rock samples.",
        nasaConnection: "NASA Robotic Arm Sample Acquisition & Caching System",
        realNasaFact: "Perseverance carries a 2.1-meter robotic arm equipped with a rotary drill, camera, and spectrometer.",
        params: { targetSamples: 2 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 64,
        missionId: 7,
        levelInMission: 4,
        title: "Search for Water Ice with Ground Radar",
        archetype: "research",
        subType: "water_ice_radar",
        story: "Activate RIMFAX ground-penetrating radar! Scan beneath the regolith to locate buried ancient water ice glaciers.",
        objective: "Scan the subsurface with radar to detect and pinpoint underground water ice deposits.",
        nasaConnection: "NASA RIMFAX Ground-Penetrating Radar on Mars Perseverance",
        realNasaFact: "RIMFAX sends radar pulses up to 10 meters beneath the Martian surface to map hidden layers of rock and ice.",
        params: { targetIce: 1 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 65,
        missionId: 7,
        levelInMission: 5,
        title: "Operate Research Core Drill",
        archetype: "research",
        subType: "core_drilling",
        story: "Park rover over bedrock. Engage rotary percussion drill (Press ENGAGE / Space) to extract a pristine core sample.",
        objective: "Drill core sample to 100% depth into the bedrock using the rotary percussion drill.",
        nasaConnection: "NASA Mars Sample Return Sealed Core Tube Caching",
        realNasaFact: "Rover drill bits cut pencil-thick cylindrical rock cores that are sealed inside ultra-clean titanium tubes.",
        params: { targetDepth: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 66,
        missionId: 7,
        levelInMission: 6,
        title: "Analyse Samples in the Laboratory",
        archetype: "research",
        subType: "lab_spectrometer",
        story: "Transfer core sample into the onboard spectrometer laboratory. Fire laser to analyze minerals and biosignatures.",
        objective: "Operate laboratory spectrometer laser to analyze chemical composition and minerals.",
        nasaConnection: "NASA SuperCam Laser Raman & Luminescence Spectrometer",
        realNasaFact: "SuperCam fires a laser beam that flash-vaporizes rock from 7 meters away to identify atomic elements by light color.",
        params: { targetSpectrums: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 67,
        missionId: 7,
        levelInMission: 7,
        title: "Store Scientific Research Results",
        archetype: "research",
        subType: "store_findings",
        story: "Encode scientific findings, mineral compositions, and photographs into the NASA Open Science database.",
        objective: "Log and catalog research findings into the onboard scientific database.",
        nasaConnection: "NASA Open Science Data Repository (OSDR) & Planetary Data System (PDS)",
        realNasaFact: "All data collected by NASA robotic missions is published freely online for scientists and students around the world.",
        params: { targetLogs: 3 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 68,
        missionId: 7,
        levelInMission: 8,
        title: "Send Research Data to Earth (DSN Delay)",
        archetype: "research",
        subType: "dsn_delay_transmission",
        story: "Align parabolic dish to Earth. Transmit data across deep space, accounting for realistic speed-of-light delay countdown.",
        objective: "Align high-gain dish to NASA Deep Space Network and complete deep-space transmission delay timer.",
        nasaConnection: "NASA Deep Space Network (DSN) 70-Meter Antennas in Goldstone, Madrid & Canberra",
        realNasaFact: "Radio signals traveling at the speed of light (300,000 km/s) take 5 to 20 minutes to cross space between Mars and Earth!",
        params: { targetAngle: 135, delaySeconds: 3.5 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 69,
        missionId: 7,
        levelInMission: 9,
        title: "Prepare the Return Spacecraft",
        archetype: "research",
        subType: "mav_preparation",
        story: "Mission objectives complete! Board the Mars/Moon Ascent Vehicle (MAV), load core samples, and verify propellant.",
        objective: "Transfer crew and sealed sample tubes to the MAV return craft and initiate launch countdown.",
        nasaConnection: "NASA Mars Sample Return Mars Ascent Vehicle (MAV)",
        realNasaFact: "The Mars Ascent Vehicle will become the first rocket in history to launch into space from the surface of another planet!",
        params: { targetSamples: 3, targetFuel: 100 },
        reward: { stars: 3, sciencePoints: 100 }
      },
      {
        globalLevel: 70,
        missionId: 7,
        levelInMission: 10,
        title: "Launch, Travel Back & Land Safely on Earth",
        archetype: "research",
        subType: "earth_splashdown",
        story: "Atmospheric re-entry! Guide the Orion capsule through fiery heat shield ionization and deploy 3 giant parachutes for safe Pacific Ocean splashdown!",
        objective: "Fire re-entry thrusters, survive heat shield deceleration, and deploy parachutes for a safe ocean splashdown!",
        nasaConnection: "NASA Artemis 1 Orion Capsule Pacific Ocean Splashdown & Navy Recovery Operations",
        realNasaFact: "Orion's heat shield endures 2,800°C (5,000°F) at Mach 32 before three 35-meter parachutes gently drop the spacecraft into the sea. Welcome home, SPACE WARS Commander!",
        params: { targetAltitude: 0, maxSpeed: 100 },
        reward: { stars: 3, sciencePoints: 200 }
      }
    ]
  }
];

// Helper functions for easy level lookup across all 70 levels
function getLevelByGlobalIndex(globalIndex) {
  const gIdx = parseInt(globalIndex, 10) || 1;
  for (const mission of MISSIONS_DATA) {
    for (const level of mission.levels) {
      if (level.globalLevel === gIdx) {
        return { mission, level };
      }
    }
  }
  return { mission: MISSIONS_DATA[0], level: MISSIONS_DATA[0].levels[0] };
}

function getMissionById(missionId) {
  const mId = parseInt(missionId, 10) || 1;
  return MISSIONS_DATA.find(m => m.id === mId) || MISSIONS_DATA[0];
}

if (typeof window !== 'undefined') {
  window.MISSIONS_DATA = MISSIONS_DATA;
  window.getLevelByGlobalIndex = getLevelByGlobalIndex;
  window.getMissionById = getMissionById;
}

if (typeof module !== 'undefined') {
  module.exports = MISSIONS_DATA;
  module.exports.getLevelByGlobalIndex = getLevelByGlobalIndex;
  module.exports.getMissionById = getMissionById;
}
