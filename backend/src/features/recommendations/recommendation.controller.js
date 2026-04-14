import driver from '../../config/database.js';

/** Convierte un valor neo4j.Integer (o number) a JS number de forma segura. */
const toNumber = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val.toNumber === 'function') return val.toNumber();
  return parseInt(String(val), 10);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/recommendations/:nombre
// Canciones que gustan a los AMIGOS del usuario pero él/ella aún no tiene.
// ─────────────────────────────────────────────────────────────────────────────
export const getRecommendations = async (req, res) => {
  const { nombre } = req.params;

  if (!nombre?.trim()) {
    return res.status(400).json({ success: false, message: 'El parámetro "nombre" es requerido.' });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $nombre})-[:AMIGO_DE]-(amigo)-[:LE_GUSTA]->(cancion)
       WHERE NOT (u)-[:LE_GUSTA]->(cancion)
       OPTIONAL MATCH (cancion)-[:PERTENECE_A]->(genero:Genero)
       OPTIONAL MATCH (artista:Artista)-[:COMPUSO]->(cancion)
       RETURN DISTINCT cancion.titulo   AS titulo,
                       cancion.bpm      AS bpm,
                       genero.nombre    AS genero,
                       artista.nombre   AS artista,
                       amigo.nombre     AS recomendadoPor`,
      { nombre: nombre.trim() }
    );

    const data = result.records.map((r) => ({
      titulo:        r.get('titulo'),
      bpm:           toNumber(r.get('bpm')),
      genero:        r.get('genero'),
      artista:       r.get('artista'),
      recomendadoPor: r.get('recomendadoPor'),
    }));

    const message = data.length === 0
      ? `No se encontraron recomendaciones para "${nombre.trim()}". ¿El usuario existe en el grafo?`
      : undefined;

    return res.status(200).json({
      success: true,
      usuario: nombre.trim(),
      total: data.length,
      data,
      ...(message && { message }),
    });
  } catch (error) {
    console.error('❌ Error en getRecommendations:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno.', error: error.message });
  } finally {
    await session.close();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/recommendations/artist/:nombre
// Artistas del mismo Género que los artistas que el usuario SIGUE,
// pero a quienes el usuario todavía NO sigue.
// ─────────────────────────────────────────────────────────────────────────────
export const getArtistRecommendations = async (req, res) => {
  const { nombre } = req.params;

  if (!nombre?.trim()) {
    return res.status(400).json({ success: false, message: 'El parámetro "nombre" es requerido.' });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Usuario {nombre: $nombre})-[:SIGUE]->(artistaSeguido:Artista)
       MATCH (artistaSeguido)-[:COMPUSO]->(:Cancion)-[:PERTENECE_A]->(genero:Genero)
       MATCH (otroArtista:Artista)-[:COMPUSO]->(:Cancion)-[:PERTENECE_A]->(genero)
       WHERE NOT (u)-[:SIGUE]->(otroArtista)
         AND otroArtista <> artistaSeguido
       WITH otroArtista,
            collect(DISTINCT genero.nombre)    AS generos,
            collect(DISTINCT artistaSeguido.nombre) AS conexionVia,
            count(DISTINCT genero)             AS relevancia
       RETURN otroArtista.nombre       AS nombre,
              otroArtista.nacionalidad AS nacionalidad,
              generos,
              conexionVia,
              relevancia
       ORDER BY relevancia DESC
       LIMIT 10`,
      { nombre: nombre.trim() }
    );

    const data = result.records.map((r) => ({
      nombre:       r.get('nombre'),
      nacionalidad: r.get('nacionalidad'),
      generos:      r.get('generos'),
      conexionVia:  r.get('conexionVia'),
      relevancia:   toNumber(r.get('relevancia')),
    }));

    const message = data.length === 0
      ? `No se encontraron artistas recomendados para "${nombre.trim()}". Verifica que el usuario siga a algún artista.`
      : undefined;

    return res.status(200).json({
      success: true,
      usuario: nombre.trim(),
      total: data.length,
      data,
      ...(message && { message }),
    });
  } catch (error) {
    console.error('❌ Error en getArtistRecommendations:', error.message);
    return res.status(500).json({ success: false, message: 'Error interno.', error: error.message });
  } finally {
    await session.close();
  }
};
