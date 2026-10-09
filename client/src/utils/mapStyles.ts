// Map styles configuration for MapLibre GL
// 100% free with NO watermark and NO mandatory API key!

// Optional user-supplied tokens from .env
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
const cartoKey = import.meta.env.VITE_CARTO_API_KEY
const customStyleEnv = import.meta.env.VITE_MAP_STYLE

export const MAP_STYLES = {
  // Sleek cyberpunk dark mode (Vector MapLibre style - NO watermark, crisp streets & labels)
  dark: mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${mapboxToken}`
    : cartoKey
    ? `https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?api_key=${cartoKey}`
    : 'https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',


  // Standard OpenStreetMap street view
  streets: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },

  // Carto Voyager (Clean modern light mode)
  voyager: {
    version: 8,
    sources: {
      'carto-voyager': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [
      {
        id: 'carto-voyager-layer',
        type: 'raster',
        source: 'carto-voyager',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },

  // High-resolution Esri World Imagery (Satellite)
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
      },
    },
    layers: [
      {
        id: 'esri-satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
}

export type MapStyleKey = keyof typeof MAP_STYLES

export function getDefaultMapStyle(): any {
  // If user configured a custom style in .env, use that
  const custom = import.meta.env.VITE_MAP_STYLE
  if (custom) return custom

  // Otherwise return CartoDB Dark Matter for the cyber dark look
  return MAP_STYLES.dark
}

