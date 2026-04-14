import TrendingSection from './features/discovery/components/TrendingSection';
import RecommendationList from './features/recommendations/components/RecommendationList';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header global ── */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3v11.586A4 4 0 1 0 11 18V7h5V3H9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none">
              StatuMusic <span className="text-indigo-400">Graph</span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">Powered by Neo4j</p>
          </div>
          {/* Indicador live */}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Graph
          </div>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <div className="py-10 text-center mb-8">
          <p className="inline-block text-xs font-semibold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4">
            Recomendaciones del Grafo
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Descubre música a través<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {' '}de tu red social
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
            Explora canciones y artistas relacionados con lo que tus amigos escuchan en el grafo StatuMusic.
          </p>
        </div>

        {/* Sección Tendencias (carga automáticamente) */}
        <TrendingSection />

        {/* Divisor */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-600 font-medium uppercase tracking-wider">Explorar</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Búsqueda personalizada */}
        <RecommendationList />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600">
        StatuMusic Graph · Construido con Neo4j, Express &amp; React
      </footer>
    </div>
  );
}

export default App;
