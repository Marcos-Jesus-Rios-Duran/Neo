import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { verifyConnectivity } from './src/config/database.js';

// ── Feature: Recommendations ──────────────────────────────────────────────
import {
  getRecommendations,
  getArtistRecommendations,
} from './src/features/recommendations/recommendation.controller.js';

// ── Feature: Discovery ───────────────────────────────────────────────────
import { getTopSongs } from './src/features/discovery/discovery.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rutas: Discovery ──────────────────────────────────────────────────────
app.get('/api/v1/discovery/top', getTopSongs);

// ── Rutas: Recommendations ────────────────────────────────────────────────
// IMPORTANTE: la ruta con segmento estático (/artist/) DEBE ir ANTES
// de la ruta con parámetro dinámico (/:nombre) para evitar colisiones.
app.get('/api/v1/recommendations/artist/:nombre', getArtistRecommendations);
app.get('/api/v1/recommendations/:nombre', getRecommendations);

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
});

// ── Inicio del servidor ───────────────────────────────────────────────────
const startServer = async () => {
  try {
    await verifyConnectivity();
    app.listen(PORT, () => {
      console.log(`\n🚀 StatuMusic Graph API corriendo en http://localhost:${PORT}`);
      console.log('📡 Rutas disponibles:');
      console.log(`   GET /api/v1/health`);
      console.log(`   GET /api/v1/discovery/top`);
      console.log(`   GET /api/v1/recommendations/:nombre`);
      console.log(`   GET /api/v1/recommendations/artist/:nombre\n`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
