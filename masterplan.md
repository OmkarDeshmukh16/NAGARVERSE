# MASTER BUILD PROMPT — NAGARVERSE

## AI-Powered 3D City Exploration, Intelligence & Safety Platform

Act as a world-class product designer, senior MERN stack engineer, AI engineer, geospatial developer, and creative frontend developer. Build a complete, functional, visually extraordinary hackathon application named **NAGARVERSE — Explore Beyond the Ordinary.**

Do not build a generic tourism website, a static dashboard, or a simple CRUD application. Create an immersive, interactive urban intelligence platform that makes exploring a city smarter, safer, and more enjoyable.

The application should initially focus on **Pune, Maharashtra, India**, while using an architecture that supports additional cities in the future.

## 1. Core vision

Transform scattered city information into one intelligent platform combining:

* AI-powered city discovery and personalized recommendations.
* Interactive 3D city exploration and geospatial navigation.
* Safety intelligence and safer-route recommendations.
* Historical landmarks, culture, local food, and hospitality.
* Real-time or clearly labeled simulated traffic, weather, and civic insights.
* Community reports with location, photographs, and voice notes.
* Comparisons of the best and worst places based on transparent criteria.

The product must feel like a combination of a futuristic digital city, an intelligent travel companion, and a civic intelligence system.

## 2. Technology stack

Use the MERN stack as the primary architecture.

**Frontend**

* React.js with Vite.
* TypeScript for maintainable frontend code.
* Tailwind CSS.
* Framer Motion for smooth UI animations.
* React Three Fiber and Drei for interactive 3D scenes.
* Three.js for 3D rendering and custom effects.
* GSAP with ScrollTrigger for cinematic scroll-driven animations where appropriate.
* Lucide React for standard interface icons.
* React Router for navigation.
* TanStack Query for API state and caching.
* Recharts for analytics and insights.

**Backend**

* Node.js.
* Express.js.
* MongoDB Atlas.
* Mongoose.
* JWT authentication and secure password hashing.
* Zod for request and AI response validation.
* REST APIs with clear error handling.

**Maps and geolocation**

* MapLibre GL JS with a suitable OpenStreetMap-compatible basemap, or Leaflet where more appropriate.
* OpenStreetMap and Overpass API for discoverable points of interest.
* OSRM or another suitable routing provider for route geometry, subject to provider availability.
* Browser geolocation with explicit user permission.
* Geospatial queries using MongoDB 2dsphere indexes.

**AI**

* Gemini API or another configurable LLM provider through the backend.
* AI city concierge with structured responses.
* Natural-language search and itinerary generation.
* Place summaries, report categorization, and contextual recommendations.
* Optional speech-to-text through a supported browser or API capability.

**Other integrations**

* Open-Meteo or another suitable weather API.
* Configurable traffic-data provider if accessible.
* Cloudinary or equivalent for optional image uploads.
* WebSocket or Socket.IO for live updates if needed.

Keep API keys in environment variables. Never expose private keys in frontend code. Implement graceful fallbacks for unavailable APIs and rate limits.

## 3. Visual identity and design system

Create a premium, cinematic, futuristic interface with strong visual storytelling.

Design language:

* Deep midnight navy and near-black backgrounds.
* Electric cyan, violet, and restrained orange highlights.
* Glassmorphism panels with subtle borders and realistic depth.
* Atmospheric lighting, bloom-like effects, soft shadows, and layered parallax.
* Large editorial typography paired with compact dashboard labels.
* High-quality city imagery and detailed 3D landmarks.
* Responsive layouts that remain usable on mobile devices.

Avoid excessive neon, oversized typography, cluttered dashboards, and generic template-like cards. The application must feel like a polished product built by a highly skilled design and engineering team.

### 3D experience requirements

Use real interactive 3D objects, not just images pretending to be 3D.

Build:

1. A floating miniature 3D city as the hero centerpiece.
2. Animated landmark structures inspired by Pune's Shaniwar Wada, Aga Khan Palace, and Sinhagad Fort.
3. 3D location pins with hover states, labels, and selection animations.
4. 3D food, hotel, heritage, weather, and safety icons.
5. An animated 3D shield representing neighborhood safety.
6. A 3D route visualization with glowing path segments and moving markers.
7. A 3D weather scene with clouds, rain, sunlight, or fog when appropriate.
8. A rotating city globe or miniature city model in the exploration section.
9. Depth-aware modal transitions and animated loading states.

Use GLB/GLTF models from legally usable sources or create lightweight procedural models with Three.js. Use optimized, licensed 3D assets wherever possible.

Do not use emoji as the main 3D icon system. Standard Lucide icons may supplement the 3D elements.

Use Framer Motion for entrance animations, GSAP for selected cinematic sequences, and React Three Fiber for 3D interactions. Avoid running multiple animation systems on the same element.

Implement reduced-motion preferences and fallbacks for devices that cannot render heavy 3D scenes.

## 4. Main landing page

Create a memorable landing page that immediately communicates the product's value.

### Navigation bar

* NAGARVERSE logo with a distinctive custom 3D-inspired mark.
* Home.
* Explore.
* Safety.
* City Insights.
* Community.
* Login/Profile.
* A prominent "Explore My City" CTA.

Keep the navbar compact, translucent, and responsive.

### Hero section

Headline:

"YOUR CITY. A THOUSAND STORIES. ONE SMARTER WAY TO EXPLORE."

Supporting text:

"Discover hidden gems, understand your surroundings, and navigate urban chaos with AI-powered city intelligence."

Include:

* A large floating 3D Pune city model.
* Animated roads, landmarks, miniature buildings, trees, and location markers.
* A search bar for natural-language queries.
* Quick actions for Food, Heritage, Hotels, Safety, Weather, and Traffic.
* An interactive cursor-responsive 3D scene.
* A clear CTA that opens the functional exploration experience.

Add a small city status panel showing the current data freshness and available live information.

Use scroll-triggered transitions to move visually from the hero city into the discovery dashboard.

## 5. Explore — interactive city discovery

Build a fully functional discovery experience.

Layout:

* Interactive map as the primary visual area.
* Filterable results panel.
* Search and category controls.
* Optional 3D landmark previews.
* List and map view switching.

Categories:

* Street food and restaurants.
* Cafes and hidden gems.
* Hotels and budget accommodation.
* Historical landmarks.
* Museums and cultural destinations.
* Parks and nature.
* Shopping destinations.
* Hospitals and essential services.
* Public transport and transit stations.

Each place card should include:

* Name and photograph where available.
* Category.
* Distance when the user's location is available.
* Address and coordinates where available.
* Source-backed ratings and prices when available.
* Opening hours where available.
* Accessibility details when available.
* Heritage or historical information where relevant.
* Data source and last-updated time.
* Save, share, and view-on-map actions.

Provide sorting by distance, affordability, rating, category, and available safety indicators.

Search must work with natural language, for example:
"Find affordable Maharashtrian food near Shaniwar Wada with good public transport access."

The AI should translate the request into structured filters and produce results from actual available place data. It must not invent businesses, reviews, prices, ratings, or opening hours.

If external services are unavailable, use clearly labeled demonstration data rather than pretending to have live data.

## 6. Safety intelligence center

Build a dedicated safety interface, not merely a page with red map markers.

Include:

* Map overlays for verified reports, accident-prone locations, and relevant hazards.
* Severity filters.
* Time filters.
* Incident categories such as road hazards, poorly lit areas, flooding, traffic incidents, and reported harassment.
* Report timestamps and source attribution.
* A report detail panel with evidence and verification status.
* A safer-route recommendation interface.
* An explanation of why a route is recommended.

Let users enter a starting point and destination, compare available routes, and view route length and estimated duration when supported by the routing provider.

The system may rank routes using documented factors such as verified recent incidents, route distance, lighting information where available, road conditions, and traffic data.

Do not label a route "safe" merely because no reports exist. Display "lower reported risk" or "insufficient data" where appropriate.

Do not fabricate incident statistics, crime hotspots, or real-time emergency intelligence. Display data coverage and uncertainty.

Include an emergency information panel with verified emergency contacts for the supported region, clearly separating official information from community reports.

## 7. AI city concierge

Build a floating AI assistant named "Navi."

The interface should resemble a futuristic 3D conversational orb with subtle idle motion, an animated listening state, and a glowing response indicator.

Users should be able to ask:

* "Plan a budget-friendly one-day trip around Pune."
* "Find historical places near me."
* "What can I explore this evening?"
* "Compare two neighborhoods for accessibility and affordability."
* "Find a quieter alternative to this crowded attraction."
* "Suggest a route that avoids known road hazards."
* "What should I know before visiting Sinhagad Fort?"

The assistant must:

1. Interpret user intent.
2. Retrieve relevant place, route, weather, or civic information.
3. Use available evidence to generate an answer.
4. Provide links or map actions for referenced places.
5. Distinguish verified facts, estimates, community reports, and AI-generated suggestions.
6. State when data is missing or outdated.
7. Return validated structured data for itinerary cards and map markers.

Do not rely on the language model's memory for current local facts. Ground recommendations in retrieved data.

Use a provider abstraction for the LLM so API providers can be changed without rewriting the application.

If no AI API key is configured, provide a limited rule-based demonstration assistant and clearly identify it as a demo mode.

## 8. Smart itinerary builder

Create an itinerary generator that builds practical city exploration plans.

Inputs:

* Starting location.
* Available time.
* Budget range.
* Interests.
* Preferred travel mode.
* Group type.
* Accessibility needs.
* Safety preferences.

Generate a timeline containing recommended places, estimated travel times, approximate spending where evidence is available, and a route displayed on the map.

Include:

* Drag-and-drop stop ordering if practical.
* Add/remove destination actions.
* Recalculate itinerary.
* Save itinerary.
* Share itinerary.
* Alternate suggestions when a place is unavailable or unsuitable.

Respect realistic distances and opening hours when known. Explain estimates when data is incomplete.

## 9. Best vs. worst places comparison

Build a visually distinctive comparison interface.

Users can select two or more locations and compare:

* Reported safety indicators.
* Cleanliness observations.
* Affordability.
* Available ratings.
* Accessibility.
* Public transport access.
* Green spaces.
* Crowd or congestion indicators where available.

Display a radar chart or comparison visualization with metric definitions and source information.

Allow users to customize the weights used to rank locations.

Never generate arbitrary scores without a documented calculation. Show "not enough data" for missing metrics rather than treating missing information as a poor score.

Use neutral labels such as "higher-rated option," "more affordable," or "more recent reported hazards" instead of declaring a neighborhood inherently bad or dangerous.

## 10. City pulse — live insights dashboard

Create a city intelligence dashboard with animated visualizations for:

* Weather conditions.
* Traffic conditions when a supported provider is configured.
* Recently submitted citizen reports.
* Available public events.
* Reported congestion.
* City exploration trends.
* Data source health and freshness.

Include a beautiful animated 3D weather widget and a city activity timeline.

Provide time filters and neighborhood filters where the underlying data supports them.

When a live API is unavailable, use labeled sample data with a visible "Demo data" indicator. Never present simulated information as real-time information.

## 11. Citizen reporting system

Allow users to submit reports with:

* Report category.
* Description.
* Map location.
* Optional photograph.
* Optional voice recording.
* Timestamp.
* Optional anonymous display.

Implement upload validation, file-size limits, secure storage, and rate limiting.

For voice reports, support recording and playback in the browser. Implement transcription only when a speech-to-text service is configured.

Use AI to suggest a report category and concise summary, but require confirmation before submission.

Add moderation and verification states:

* Submitted.
* Under review.
* Verified.
* Rejected.
* Resolved.

Include duplicate detection or duplicate-report suggestions where practical.

Do not expose sensitive personal information or publicly display precise locations for reports where doing so could endanger a person.

## 12. History and culture mode

Create a separate immersive heritage experience.

Show historical landmarks using rich imagery, 3D-inspired cards, historical timelines, and concise cultural stories.

For Pune, include suitable examples such as Shaniwar Wada, Aga Khan Palace, Sinhagad Fort, and Raja Dinkar Kelkar Museum.

Features:

* Landmark details.
* Historical timeline.
* Cultural context.
* Nearby places.
* Route planning.
* Visit information from available sources.
* Optional audio narration.
* Immersive landmark detail pages.

Clearly distinguish historical facts supported by sources from AI-generated narrative descriptions.

Do not reproduce copyrighted tour-guide content or unlicensed media.

## 13. Authentication, saved places, and profile

Implement:

* Registration and login.
* Secure password hashing.
* JWT authentication.
* Protected backend routes.
* User profile.
* Saved places.
* Saved itineraries.
* Submitted reports.
* User preferences.
* Search history controls.
* Logout.

Include input validation, safe error handling, authentication middleware, and environment-based secrets.

## 14. MongoDB data model

Design appropriate Mongoose schemas for:

* User.
* Place.
* City.
* IncidentReport.
* CitizenReport.
* Itinerary.
* SavedPlace.
* WeatherSnapshot.
* TrafficSnapshot.
* SourceMetadata.

Use GeoJSON Point fields and 2dsphere indexes for geographic searches.

Store provenance, verification state, timestamps, and source identifiers for relevant data.

Avoid storing sensitive location history unnecessarily.

## 15. Backend API architecture

Build organized Express routes, controllers, services, middleware, and models.

Suggested endpoints:

Authentication:

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/me

Places:

* GET /api/places
* GET /api/places/:id
* GET /api/places/nearby
* GET /api/places/search

AI:

* POST /api/ai/chat
* POST /api/ai/itinerary
* POST /api/ai/compare
* POST /api/ai/summarize-report

Safety:

* GET /api/safety/incidents
* POST /api/safety/reports
* GET /api/safety/routes

Community:

* POST /api/reports
* GET /api/reports
* GET /api/reports/:id
* PATCH /api/reports/:id/status

Itineraries:

* POST /api/itineraries
* GET /api/itineraries
* GET /api/itineraries/:id
* PATCH /api/itineraries/:id
* DELETE /api/itineraries/:id

Insights:

* GET /api/insights/overview
* GET /api/insights/weather
* GET /api/insights/traffic

Modify endpoint structures when necessary, but implement real working handlers rather than leaving empty placeholder routes.

Add pagination, filtering, validation, rate limiting, and centralized error handling.

## 16. Unique hackathon feature: City Digital Twin

Create a dedicated "City Digital Twin" experience that combines a 3D city model with interactive intelligence layers.

The user should be able to:

* Rotate and zoom the city model.
* Select a landmark.
* Toggle food, heritage, hotels, and public-service layers.
* Enable a safety-report overlay.
* View weather conditions.
* Inspect place details.
* Switch between 3D exploration and the conventional 2D map.

Use actual map or place data for available markers. If the 3D model is illustrative rather than geographically accurate, label it as a conceptual visualization.

Prioritize a performant, convincing interactive prototype over an enormous but nonfunctional digital twin.

## 17. Signature motion and microinteractions

Implement carefully designed motion throughout the product:

* Animated 3D logo reveal.
* Floating hero city with subtle rotation.
* Scroll-triggered scene transitions.
* Staggered place-card entrances.
* Glowing route animations.
* Map marker hover and selection states.
* Animated comparison charts.
* Smooth modal and navigation transitions.
* AI orb states for idle, listening, processing, and responding.
* Skeleton loaders and useful empty states.
* Subtle magnetic or perspective effects on selected buttons.

Keep animation purposeful and smooth. Avoid excessive particles, constant movement, and unnecessary visual distractions.

## 18. Responsive design and accessibility

Support desktop, tablet, and mobile layouts.

Requirements:

* Responsive navigation.
* Touch-friendly controls.
* Accessible form labels.
* Keyboard navigation.
* Appropriate color contrast.
* Screen-reader descriptions for important controls.
* Reduced-motion support.
* 2D fallbacks for 3D-heavy sections.
* Lazy loading of 3D models and images.
* Optimized textures, model sizes, and rendering.
* Graceful handling of API failures.

The app must remain usable on an average laptop and a modern smartphone.

## 19. Project architecture and development workflow

Create a clean monorepo structure:

client/
src/
components/
pages/
features/
hooks/
services/
contexts/
three/
maps/
animations/
types/
utils/

server/
src/
routes/
controllers/
services/
models/
middleware/
validators/
config/
utils/

shared/
types/

Include:

* Root and package-specific package.json files.
* .env.example files.
* README with setup instructions.
* MongoDB configuration.
* Seed scripts.
* API documentation.
* Reusable components.
* Consistent linting and formatting.
* Meaningful loading, error, and empty states.

## 20. Build order — follow this sequence

Phase 1: Inspect the environment, create the project structure, configure React/Vite, Express, MongoDB, and the design system.

Phase 2: Build the responsive landing page, animated 3D hero, navigation, and core visual components.

Phase 3: Implement the interactive city exploration page, map, location markers, search, filters, and place details.

Phase 4: Implement safety reports, route comparison, city insights, and the citizen-reporting workflow.

Phase 5: Implement the AI concierge, itinerary generation, place comparison, and grounded AI responses.

Phase 6: Implement authentication, saved places, persistence, and backend validation.

Phase 7: Add seed data, API integrations, error handling, responsive behavior, and performance optimizations.

Phase 8: Test all critical user journeys, resolve build errors, and prepare a complete README and environment setup.

Do not stop after creating the landing page. Continue implementing the core product.

## 21. Definition of done

The project is complete only when:

* The frontend starts successfully.
* The backend starts successfully.
* MongoDB connection handling works.
* The landing page is visually polished.
* The 3D hero renders and supports interaction.
* Navigation leads to working pages.
* Search and filters change the results.
* Map markers open relevant place details.
* Place comparisons use transparent metrics.
* Safety reports can be submitted and retrieved.
* The AI assistant uses a configured provider or an explicitly labeled fallback.
* Itinerary data is generated from available places and can be saved.
* Authentication and protected routes function.
* Missing API keys do not crash the app.
* Live and simulated information are clearly distinguished.
* No important primary CTA is decorative or nonfunctional.
* No critical build errors remain.

## 22. Final execution instructions

Start by inspecting the existing workspace. If a project already exists, preserve useful code and improve it instead of blindly replacing everything.

Then create a concise implementation plan and begin coding immediately.

Do not stop at the planning stage. Do not merely return code snippets or mockup screenshots. Build the actual application in the workspace, install compatible dependencies, start the frontend and backend, inspect errors, and fix them.

Prioritize in this order:

1. A spectacular and responsive 3D experience.
2. A working interactive city map and place discovery.
3. Functional AI-powered recommendations.
4. Credible safety intelligence.
5. Reliable MERN backend and persistence.
6. Performance, accessibility, and polish.

When a third-party API or external service requires credentials, implement the integration, document the required environment variables, and provide a working demo fallback.

The final result should look like a premium, investor-ready product and demonstrate genuine technical functionality to hackathon judges.

**Product tagline: "NAGARVERSE — Turn Urban Chaos into Smart Choices."**
