import { useState } from 'react';
import { fetchRecommendations, fetchArtistRecommendations } from '../../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes / helpers
// ─────────────────────────────────────────────────────────────────────────────
const TAB_FRIENDS = 'friends';
const TAB_ARTISTS = 'artists';

const GENRE_COLORS = {
  'Jazz':       'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Soundtrack': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Rock':       'bg-red-500/20 text-red-300 border-red-500/40',
  'Pop':        'bg-pink-500/20 text-pink-300 border-pink-500/40',
  'Clásica':    'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'default':    'bg-slate-600/30 text-slate-300 border-slate-500/40',
};

const genreClass = (g) => GENRE_COLORS[g] || GENRE_COLORS['default'];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes reutilizables
// ─────────────────────────────────────────────────────────────────────────────
const GenreBadge = ({ genero }) => {
  if (!genero) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${genreClass(genero)}`}>
      {genero}
    </span>
  );
};

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SongCard — color según tipo: 'friend' (indigo) | 'global' (emerald)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_THEME = {
  friend: {
    border:  'border-indigo-500/30 hover:border-indigo-400/60',
    glow:    'hover:shadow-indigo-900/30',
    from:    'from-slate-800/80 to-indigo-900/20',
    ring:    'ring-indigo-400/30',
    badge:   'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    label:   '👤 Amigo',
  },
  global: {
    border:  'border-emerald-500/30 hover:border-emerald-400/60',
    glow:    'hover:shadow-emerald-900/30',
    from:    'from-slate-800/80 to-emerald-900/20',
    ring:    'ring-emerald-400/30',
    badge:   'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    label:   '🌐 Global',
  },
};

const SongCard = ({ titulo, bpm, genero, artista, recomendadoPor, tipo = 'friend' }) => {
  const theme = CARD_THEME[tipo] ?? CARD_THEME.friend;

  return (
    <div className={`
      relative group rounded-2xl border bg-gradient-to-br ${theme.from} ${theme.border}
      backdrop-blur-sm p-5 flex flex-col gap-3
      hover:shadow-lg ${theme.glow} transition-all duration-300
    `}>
      {/* Tipo source badge */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}>
          {theme.label}
        </span>
        {bpm !== null && (
          <span className="text-xs font-mono text-slate-500">{bpm} bpm</span>
        )}
      </div>

      {/* Ícono + título */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center flex-shrink-0 border border-slate-600/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 3v11.586A4 4 0 1 0 11 18V7h5V3H9z" />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-bold text-sm leading-snug truncate" title={titulo}>{titulo}</p>
          {artista && <p className="text-slate-400 text-xs mt-0.5 truncate">🎸 {artista}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
        <GenreBadge genero={genero} />
        {recomendadoPor && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            ❤️ <span className="font-medium text-slate-300">{recomendadoPor}</span>
          </span>
        )}
      </div>

      {/* Glow ring */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ${theme.ring}`} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ArtistCard — tema ámbar
// ─────────────────────────────────────────────────────────────────────────────
const ArtistCard = ({ nombre, nacionalidad, generos, conexionVia }) => (
  <div className="relative group rounded-2xl border border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-br from-slate-800/80 to-amber-900/10 backdrop-blur-sm p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-amber-900/20 transition-all duration-300">
    {/* Header */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
        </svg>
      </div>
      <div className="overflow-hidden">
        <p className="text-white font-bold text-sm truncate" title={nombre}>{nombre}</p>
        {nacionalidad && <p className="text-slate-400 text-xs">🌍 {nacionalidad}</p>}
      </div>
    </div>

    {/* Géneros */}
    {generos?.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {generos.map((g) => <GenreBadge key={g} genero={g} />)}
      </div>
    )}

    {/* Conexión */}
    {conexionVia?.length > 0 && (
      <p className="text-xs text-slate-500 border-t border-slate-700/40 pt-2 truncate">
        🔗 Vía: <span className="text-slate-400 font-medium">{conexionVia.slice(0, 2).join(', ')}</span>
      </p>
    )}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-amber-400/30" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Estado vacío / info
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500 col-span-full">
    <span className="text-5xl mb-3 opacity-30">{icon}</span>
    <p className="text-center text-sm max-w-xs leading-relaxed">{message}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const RecommendationList = () => {
  const [tab, setTab]             = useState(TAB_FRIENDS);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [infoMsg, setInfoMsg]     = useState(null);
  const [searched, setSearched]   = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  const reset = () => {
    setResults([]);
    setError(null);
    setInfoMsg(null);
    setSearched(false);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    reset();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setLoading(true);
    reset();

    try {
      const apiFn = tab === TAB_FRIENDS ? fetchRecommendations : fetchArtistRecommendations;
      const data  = await apiFn(trimmed);

      setCurrentUser(trimmed);
      setResults(data.data);
      setSearched(true);
      if (data.message) setInfoMsg(data.message);
    } catch (err) {
      setError(err.message);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const isFriendsTab = tab === TAB_FRIENDS;

  return (
    <section className="max-w-5xl mx-auto px-4 pb-16">
      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-xl bg-slate-800/60 border border-slate-700/50 w-fit">
        <button
          id="tab-friends-btn"
          onClick={() => handleTabChange(TAB_FRIENDS)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isFriendsTab
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎵 Amigos
        </button>
        <button
          id="tab-artists-btn"
          onClick={() => handleTabChange(TAB_ARTISTS)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            !isFriendsTab
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎸 Artistas Similares
        </button>
      </div>

      {/* ── Descripción dinámica ── */}
      <p className="text-slate-500 text-sm mb-5">
        {isFriendsTab
          ? 'Canciones que tus amigos aman y tú aún no has descubierto.'
          : 'Artistas del mismo género que los que ya sigues, pero que aún no conoces.'}
      </p>

      {/* ── Search form ── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8" role="search">
        <input
          id="search-user-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isFriendsTab ? 'Nombre de usuario (ej: Sofia)…' : 'Nombre de usuario para explorar artistas…'}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/70 text-white placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition backdrop-blur-sm"
          disabled={loading}
        />
        <button
          id="search-submit-btn"
          type="submit"
          disabled={loading || !inputValue.trim()}
          className={`flex items-center gap-2 font-semibold px-5 py-3 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isFriendsTab
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {loading ? <><Spinner /> Buscando</> : (isFriendsTab ? 'Buscar' : 'Explorar')}
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 px-5 py-4 text-sm flex items-start gap-3">
          ⚠️ <span>{error}</span>
        </div>
      )}

      {/* ── Info (sin resultados) ── */}
      {infoMsg && !error && (
        <div className="mb-6 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 px-5 py-4 text-sm">
          ℹ️ {infoMsg}
        </div>
      )}

      {/* ── Header resultados ── */}
      {searched && !error && results.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-200">
            {isFriendsTab ? '🎵 Canciones para' : '🎸 Artistas para'}{' '}
            <span className={isFriendsTab ? 'text-indigo-400' : 'text-amber-400'}>@{currentUser}</span>
          </h2>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            isFriendsTab
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Grid de resultados ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length > 0 && isFriendsTab &&
          results.map((song, i) => (
            <SongCard key={`${song.titulo}-${i}`} tipo="friend" {...song} />
          ))
        }

        {results.length > 0 && !isFriendsTab &&
          results.map((artist, i) => (
            <ArtistCard key={`${artist.nombre}-${i}`} {...artist} />
          ))
        }

        {!searched && !loading && (
          <EmptyState
            icon={isFriendsTab ? '🎵' : '🎸'}
            message={
              isFriendsTab
                ? 'Ingresa un nombre de usuario para descubrir las canciones que recomienda su red de amigos.'
                : 'Ingresa tu nombre de usuario para explorar artistas de géneros que ya disfrutas.'
            }
          />
        )}

        {searched && !error && results.length === 0 && !infoMsg && (
          <EmptyState
            icon="🔍"
            message={`Sin resultados para "${currentUser}".`}
          />
        )}
      </div>
    </section>
  );
};

export default RecommendationList;
