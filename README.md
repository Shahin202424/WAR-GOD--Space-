# 🚀 Junior Astronaut: Mission Trainer
### WAR-GOD — NASA Space Apps Challenge 2026

**Theme:** Interplanetary Human Spaceflight, Astronaut Survival, and Planetary Space Science  
**Target Audience:** Children aged 7–12 years  
**Technology:** HTML5, CSS3, JavaScript, HTML Canvas, Web Audio API, Web Speech API, and Node.js.

## 🌌 Project Overview

Junior Astronaut: Mission Trainer is a colourful, interactive, child-friendly space adventure designed to introduce children to space exploration and astronaut survival.

Players take on the role of junior astronauts and explore space through missions inspired by real NASA science, spacecraft, planetary environments, and astronaut activities.

The project aims to make space science engaging through interactive gameplay, exploration, challenges, and NASA open-data integration.

## 🎮 Game Features

- Space exploration and astronaut survival gameplay.
- Multiple missions with progressively challenging levels.
- Interactive gameplay environments and animated space visuals.
- Astronaut survival systems, including health, oxygen, water, energy, radiation, and food.
- Mission objectives, rewards, level progression, and replay functionality.
- NASA-inspired planetary exploration and space science activities.
- NASA open-data integration with appropriate offline fallback support.
- Child-friendly interface designed for ages 7–12.

## 🛰️ NASA Open Data Integration

The project uses NASA-related scientific resources to connect gameplay with real space research.

### 1. NASA DONKI
**Purpose:** Space weather events and solar activity.

- Solar flares
- Coronal Mass Ejections (CMEs)
- Solar energetic particle events
- Geomagnetic storms

Official resource: https://ccmc.gsfc.nasa.gov/DONKI/

### 2. NASA OSDR
**Purpose:** Space biology research and astronaut health studies.

- Space biology experiments
- Plant growth research
- Human health and spaceflight studies
- Biological research datasets

Official resource: https://osdr.nasa.gov/bio/repo/

### 3. NASA RadLab
**Purpose:** Space radiation research and telemetry.

- Radiation measurements
- Space environment observations
- Radiation monitoring references

Official resource: https://visualization.osdr.nasa.gov/radlab/gui/

### 4. NASA Mars Trek
**Purpose:** Planetary maps and Mars exploration.

- Mars surface maps
- Terrain visualization
- Planetary landmarks
- Rover exploration references

Official resource: https://trek.nasa.gov/mars/

### 5. NASA Image and Video Library
**Purpose:** Authentic space imagery for educational and visual experiences.

Official resource: https://images.nasa.gov/

## 🏗️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Game structure |
| CSS3 | Visual design, animation, and responsive UI |
| JavaScript | Gameplay logic and interactions |
| HTML Canvas | Game rendering and visual effects |
| Web Audio API | Game sound effects |
| Web Speech API | Optional voice interaction |
| Node.js | Backend proxy and API requests |
| NASA APIs | Space science data and resources |

## 🔐 API Security

The project includes a Node.js backend proxy for handling NASA API requests.

- API keys should remain on the backend.
- Private credentials must not be committed to GitHub.
- `.env` files should be excluded using `.gitignore`.
- `.env.example` should contain placeholders only.
- Offline fallback data should be clearly identified as demo or reference data.

## 🚀 Run Locally

### Option 1: Node.js

```bash
node server.js
```

Open:

http://localhost:3000

### Option 2: Python HTTP Server

```bash
python -m http.server 8080
```

Open:

http://localhost:8080

Use the command appropriate to the project's available files and configuration.

## 🧪 Testing

Run the project's available automated tests:

```bash
node tests/test-game.js
```

Test results should be reported based on the actual test execution. Automated assertions alone do not confirm that every level has been manually played in a browser.

## 🏆 Project Goal

Our goal is to make space exploration accessible and exciting for children by combining interactive game development with real NASA science and educational space exploration concepts.

**Project:** Junior Astronaut: Mission Trainer  
**Repository:** WAR-GOD--Space-  
**Challenge:** 2026 NASA Space Apps Challenge

---

*Created by the Junior Astronaut Mission Trainer Engineering Team.*