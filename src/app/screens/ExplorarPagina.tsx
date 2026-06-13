// Página Explorar - Cloud UCV con datos de Supabase
import { useState, useMemo, type FC } from 'react';
import { useEventos } from '@/hooks/useEventos';
import EventoCard from '@/components/ucv/EventoCard';
import EventoCardSkeleton from '@/components/ucv/EventoCardSkeleton';

const categoriaConfig = [
  { nombre: 'Académicos' as const, color: '#3B82F6', emoji: '🎓' },
  { nombre: 'Culturales' as const, color: '#D946EF', emoji: '🎵' },
  { nombre: 'Deportivos' as const, color: '#10B981', emoji: '⚽' },
  { nombre: 'Comerciales' as const, color: '#F59E0B', emoji: '💼' },
];

interface ExplorarPaginaProps {
  onVerDetalle: (id: string) => void;
}

const ExplorarPagina: FC<ExplorarPaginaProps> = ({ onVerDetalle }) => {
  const { eventos, cargando } = useEventos();
  const [searchQuery, setSearchQuery] = useState('');

  const countByCategoria = (cat: string) =>
    eventos.filter((e) => e.categoria === cat).length;

  const eventosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return eventos.filter(
      (e) => 
        e.titulo.toLowerCase().includes(query) || 
        e.categoria.toLowerCase().includes(query) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(query))
    );
  }, [eventos, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto min-w-0 px-4 py-6">
      {/* Buscador */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/>
            <path d="M21 21L16.65 16.65" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar eventos, categorías..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm text-white placeholder:text-white/40 outline-none border border-white/10 focus:border-purple-400/50 transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {searchQuery.trim() ? (
        /* Resultados de búsqueda */
        <div>
          <div className="mb-4">
            <h2 className="text-white font-bold text-xl text-balance">Resultados de búsqueda</h2>
            <p className="text-lavender text-sm mt-1">
              {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''} encontrado{eventosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            {cargando ? (
              <>
                <EventoCardSkeleton />
                <EventoCardSkeleton />
                <EventoCardSkeleton />
              </>
            ) : eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  onClick={() => onVerDetalle(evento.id)}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/>
                    <path d="M21 21L16.65 16.65" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-white font-medium">No se encontraron eventos</p>
                <p className="text-lavender text-sm mt-1 text-balance">Intenta con otros términos de búsqueda o revisa las categorías.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vista normal de Explorar */
        <>
          {/* Título */}
      <div className="mb-4">
        <h2 className="text-white font-bold text-xl text-balance">Explorar Categorías</h2>
        <p className="text-lavender text-sm mt-1">Descubre eventos por área de interés</p>
      </div>

      {/* Grid de categorías con contador real */}
      <div className="grid grid-cols-2 gap-3">
        {categoriaConfig.map((cat) => {
          const count = cargando ? null : countByCategoria(cat.nombre);
          return (
            <button
              key={cat.nombre}
              className="rounded-2xl p-4 text-left active:scale-95 transition-transform shadow-card"
              style={{ backgroundColor: `${cat.color}22`, border: `1px solid ${cat.color}44` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ backgroundColor: `${cat.color}33` }}
              >
                {cat.emoji}
              </div>
              <p className="text-white font-semibold text-sm">{cat.nombre}</p>
              <p className="text-lavender text-xs mt-0.5">
                {cargando ? '...' : `${count} evento${count !== 1 ? 's' : ''}`}
              </p>
            </button>
          );
        })}

      </div>

      {/* Total eventos */}
      {!cargando && (
        <div
          className="mt-5 rounded-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #d946ef, #a855f7)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{eventos.length} eventos disponibles</p>
            <p className="text-lavender text-xs mt-0.5">Actualizados en tiempo real</p>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default ExplorarPagina;
