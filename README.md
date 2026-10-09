# 🌆 NAGARVERSE — Explore Beyond the Ordinary

> **AI-Powered 3D City Exploration, Intelligence & Safety Platform**  
> *Initial Focus: Pune, Maharashtra, India*

NAGARVERSE transforms scattered urban data into an immersive, intelligent, and human-centric city platform. Built from the ground up for urban explorers, students, professionals, and citizens who want to experience the soul and rhythm of Pune in three dimensions.

---

## 🚀 Key Pillars & Features

### 1. 🌐 Immersive 3D Experience & Digital Twin
- **Interactive 3D Hero Experience**: Built with Three.js & React Three Fiber featuring dynamic particle networks, holographic neon rings, and rotating cyber-urban visuals.
- **Pune Digital Twin (`/digital-twin`)**: 3D conceptual architectural model of Pune with toggleable POI layers:
  - 🏛️ **Heritage Sites**: Shaniwar Wada, Aga Khan Palace, Sinhagad Fort, Pataleshwar Caves.
  - 🚆 **Transit Corridors**: Pune Metro lines, Swargate & Shivajinagar transit interchanges.
  - 💼 **Tech Corridors**: Hinjewadi Rajiv Gandhi Infotech Park & Magarpatta Cybercity.
  - Interactive camera orbit controls, fly-to POIs, and 3D architectural wireframes.

### 2. 🗺️ Geospatial Exploration & Live OSM Integration (`/explore`)
- **MapLibre GL Interactive Map**: Hardware-accelerated vector mapping centered on Pune (`18.5204° N, 73.8567° E`).
- **Real-Time Place Discovery**: Live querying via **OpenStreetMap Overpass API** with instantaneous fallback to a curated high-density catalog of Pune's iconic spots.
- **Smart Filtering & Categories**: Heritage, Cafes, Street Food, Parks, Hotels, Transit Hubs, and Shopping.
- **Place Details Slideout**: Key highlights, opening hours, pricing tier, community rating, address, and direct routing.

### 3. 🛡️ Safety Intelligence & SafeRoute Navigator (`/safety`)
- **Live Safety Heatmap**: Dynamic marker clustering colored by incident severity (Critical, High, Medium, Low).
- **SafeRoute Calculator (`SafeRoutePanel`)**: Compare route choices not just by speed, but by reported safety score, street lighting density, and verified police presence.
- **Citizen Incident Reporter (`/community`)**:
  - Multimodal report submissions: text descriptions, category tagging, and location pins.
  - **In-Browser Audio Voice Notes**: Record and upload citizen voice notes directly via `MediaRecorder`.
  - Transparent verification status (`Submitted` ➔ `Under Review` ➔ `Verified` ➔ `Resolved`).

### 4. 🤖 Navi — AI Urban Guide (`NaviOrb`)
- Floating interactive AI orb with custom animations and dynamic speech-synthesis audio guide.
- Powered by Google Gemini 1.5 with smart deterministic heuristics fallback when running offline.
- Real-time itinerary suggestions, heritage history storytelling, Marathi cultural nuances, and neighborhood tips.

### 5. 📊 City Pulse Dashboard (`/insights`)
- Real-time weather widget powered by **Open-Meteo free API** (Temperature, humidity, wind speed, weather conditions).
- Urban mobility and traffic congestion index based on arterial transit flow.
- Recharts visualizations: City activity timeline area charts and search category breakdowns.

### 6. ⚖️ Multi-Location Comparison (`/compare`)
- Side-by-side radar chart analysis of Pune neighborhoods across 5 core metrics:
  - Safety & Street Lighting
  - Transit & Metro Connectivity
  - Food & Nightlife Scene
  - Affordability & Cost Index
  - Green Spaces & Air Quality

### 7. 🗓️ AI Itinerary Builder (`/itinerary`)
- Tailored day schedules customized by duration, travel vibe (Heritage, Foodie, Romantic, Backpacker), budget tier, and pace.
- One-click saving to User Profile (`/profile`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **3D & Maps** | Three.js, `@react-three/fiber`, `@react-three/drei`, MapLibre GL |
| **Data Viz** | Recharts, TanStack React Query v5 |
| **Backend** | Node.js, Express 4, Socket.IO, Multer, Rate Limiting, CORS |
| **Database** | MongoDB with Mongoose (with instant in-memory fallback mode) |
| **External APIs** | OpenStreetMap Overpass API, Open-Meteo Weather, Google Gemini AI |

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Start the Server (Backend)
```bash
cd server
npm start
```
*Server runs on `http://localhost:5000` (with automatic in-memory fallback if local MongoDB is offline).*

### 2. Start the Client (Frontend)
```bash
cd client
npm run dev
```
*Client runs on `http://localhost:5173` with full Vite HMR and API proxy configured.*

### 3. Production Build
```bash
cd client
npm run build
```
*Builds optimized production assets to `client/dist`.*

---

## 📡 API Endpoints Reference

### AI & Navi Assistant
- `POST /api/ai/chat` — Conversational city intelligence with Gemini 1.5
- `POST /api/ai/compare` — Comparative multi-location radar analysis
- `POST /api/ai/itinerary` — Personalized day-by-day travel plans

### Places & Exploration
- `GET /api/places` — Query Pune POIs by category, search text, or bounding box
- `POST /api/places/save` — Save place to user favorites

### Safety & Community
- `GET /api/safety/incidents` — Filtered incident points for heatmap
- `POST /api/safety/routes` — Safe route calculation and risk ranking
- `GET /api/safety/stats` — Citywide safety score and response metrics
- `GET /api/reports` — Community reports feed with status filters
- `POST /api/reports` — Submit citizen incident with optional audio note
- `POST /api/reports/:id/vote` — Upvote / confirm community report

### City Pulse & Insights
- `GET /api/insights/overview` — Platform activity timeline and category metrics
- `GET /api/insights/weather` — Live weather data via Open-Meteo
- `GET /api/insights/traffic` — Arterial congestion estimates

### Authentication & Profiles
- `POST /api/auth/register` — User registration with bcrypt hashing
- `POST /api/auth/login` — JWT authentication
- `GET /api/auth/me` — Authenticated profile verification

---

## 🏆 Hackathon Winning Highlights
1. **Zero-Setup Resilience**: Works out-of-the-box even without MongoDB or external API keys thanks to high-fidelity fallback datasets.
2. **True 3D Spatial Computing**: Not just standard 2D pins — provides a full 3D Digital Twin and interactive WebGL canvas.
3. **Citizen-Powered Safety**: Practical, real-world utility that bridges navigation with public safety and citizen journalism.
4. **Authentic Pune Localization**: Real Pune landmarks (Shaniwar Wada, FC Road, Hinjewadi, Sinhagad, Tulshibaug, Koregaon Park).

---
© 2026 NAGARVERSE Team. Built with ❤️ for Pune.