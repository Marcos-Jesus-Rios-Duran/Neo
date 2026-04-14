import { useState, useEffect } from 'react';
import { fetchTopSongs } from '../../../services/api';

// ── Paleta de géneros (color por nombre de género) ────────────────────────
const GENRE_COLORS = {
  'Jazz':       'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Soundtrack': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Rock':       'bg-red-500/20 text-red-300 border-red-500/40',
  'Pop':        'bg-pink-500/20 text-pink-300 border-pink-500/40',
  'Clásica':    'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'default':    'bg-slate-600/30 text-slate-300 border-slate-500/40',
};

const genreClass = (g) => GENRE_COLORS[g] || GENRE_COLORS['default'];

// ── Sub-componente: Badge de género ───────────────────────────────────────
const GenreBadge = ({ genero }) => {
  if (!genero) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${genreClass(genero)}`}>
      {genero}
    </span>
  );
};

// ── Sub-componente: Medalla de posición ───────────────────────────────────
const RankBadge = ({ rank }) => {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <span className="text-2xl leading-none select-none">{medals[rank - 1] ?? `#${rank}`}</span>
  );
};

// ── Sub-componente: Tarjeta de tendencia ──────────────────────────────────
const TrendingCard = ({ titulo, bpm, genero, artista, totalLikes, rank }) => (
  <div className="relative group flex-1 min-w-[220px] rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/80 to-emerald-900/20 backdrop-blur-sm p-5 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-300">
    {/* Rank */}
    <div className="flex items-center justify-between mb-3">
      <RankBadge rank={rank} />
      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
        ❤️ {totalLikes ?? 0}
      </span>
    </div>

    {/* Título */}
    <p className="text-white font-bold text-base leading-snug mb-1 truncate" title={titulo}>
      {titulo}
    </p>

    {/* Artista */}
    {artista && (
      <p className="text-slate-400 text-xs mb-3 truncate">🎸 {artista}</p>
    )}

    {/* Footer */}
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
      <GenreBadge genero={genero} />
      {bpm !== null && (
        <span className="text-xs text-slate-500 font-mono">{bpm} bpm</span>
      )}
    </div>

    {/* Glow hover */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-emerald-400/30" />
  </div>
);

// ── Componente principal: TrendingSection ─────────────────────────────────
const TrendingSection = () => {
  const [songs, setSongs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchTopSongs()
      .then((res) => setSongs(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <span className="text-base">🔥</span>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-none">Tendencias Globales</h2>
          <p className="text-slate-500 text-xs mt-0.5">Las canciones con más ❤️ en el grafo</p>
        </div>
        <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Top 3
        </span>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[220px] h-36 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-700/50" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-wrap gap-4">
          {songs.length > 0
            ? songs.map((song, i) => (
                <TrendingCard key={song.titulo} rank={i + 1} {...song} />
              ))
            : (
              <p className="text-slate-500 text-sm py-8 text-center w-full">
                No hay canciones con "likes" en el grafo todavía.
              </p>
            )}
        </div>
      )}
    </section>
  );
};

export default TrendingSection;
