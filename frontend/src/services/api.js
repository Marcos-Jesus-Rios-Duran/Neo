const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/** Helper: hace fetch y lanza un error descriptivo si la respuesta no es ok. */
const apiFetch = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Error del servidor: ${response.status}`);
  }
  return response.json();
};

/**
 * Obtiene las 3 canciones globales con más "LE_GUSTA" (tendencias).
 * @returns {Promise<{ success: boolean, data: Array }>}
 */
export const fetchTopSongs = () => apiFetch('/discovery/top');

/**
 * Obtiene canciones recomendadas por amigos del grafo.
 * @param {string} nombre - Nombre del usuario.
 */
export const fetchRecommendations = (nombre) =>
  apiFetch(`/recommendations/${encodeURIComponent(nombre.trim())}`);

/**
 * Obtiene artistas recomendados basándose en los géneros de artistas seguidos.
 * @param {string} nombre - Nombre del usuario.
 */
export const fetchArtistRecommendations = (nombre) =>
  apiFetch(`/recommendations/artist/${encodeURIComponent(nombre.trim())}`);
