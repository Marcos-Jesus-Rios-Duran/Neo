import driver from '../../config/database.js';

/** Convierte un valor neo4j.Integer (o number) a JS number de forma segura. */
const toNumber = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val.toNumber === 'function') return val.toNumber();
  return parseInt(String(val), 10);
};

/**
 * GET /api/v1/discovery/top
 *
 * Devuelve las 3 canciones del grafo con más relaciones [:LE_GUSTA],
 * enriquecidas con su Género y Artista compositor.
 *
 * Query Cypher:
 * MATCH (cancion:Cancion)<-[r:LE_GUSTA]-()
 * WITH cancion, count(r) AS totalLikes
 * OPTIONAL MATCH (cancion)-[:PERTENECE_A]->(genero:Genero)
 * OPTIONAL MATCH (artista:Artista)-[:COMPUSO]->(cancion)
 * RETURN cancion.titulo AS titulo, cancion.bpm AS bpm,
 *        genero.nombre AS genero, artista.nombre AS artista, totalLikes
 * ORDER BY totalLikes DESC LIMIT 3
 */
export const getTopSongs = async (_req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (cancion:Cancion)<-[r:LE_GUSTA]-()
       WITH cancion, count(r) AS totalLikes
       OPTIONAL MATCH (cancion)-[:PERTENECE_A]->(genero:Genero)
       OPTIONAL MATCH (artista:Artista)-[:COMPUSO]->(cancion)
       RETURN cancion.titulo AS titulo,
              cancion.bpm    AS bpm,
              genero.nombre  AS genero,
              artista.nombre AS artista,
              totalLikes
       ORDER BY totalLikes DESC
       LIMIT 3`
    );

    const songs = result.records.map((record) => ({
      titulo:     record.get('titulo'),
      bpm:        toNumber(record.get('bpm')),
      genero:     record.get('genero'),
      artista:    record.get('artista'),
      totalLikes: toNumber(record.get('totalLikes')),
    }));

    return res.status(200).json({
      success: true,
      total: songs.length,
      data: songs,
    });
  } catch (error) {
    console.error('❌ Error en getTopSongs:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener las canciones en tendencia.',
      error: error.message,
    });
  } finally {
    await session.close();
  }
};
