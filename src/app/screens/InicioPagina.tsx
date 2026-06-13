// Página de Inicio - Cloud UCV con datos de Supabase
import { useState } from 'react';
import type { FC } from 'react';
import type { Categoria, Evento } from '@/types/types';
import { useEventos } from '@/hooks/useEventos';
import { useAuth } from '@/contexts/AuthContext';
import FiltrosCategorias from '@/components/ucv/FiltrosCategorias';
import EventoCard from '@/components/ucv/EventoCard';
import EventoCardSkeleton from '@/components/ucv/EventoCardSkeleton';
import FormularioEvento from '@/components/ucv/FormularioEvento';

const titulos: Record<Categoria, string> = {
  Todos: 'Eventos destacados',
  Académicos: 'Eventos Académicos',
  Culturales: 'Eventos Culturales',
  Deportivos: 'Eventos Deportivos',
  Comerciales: 'Eventos Comerciales',
};

interface InicioPaginaProps {
  onVerDetalle: (id: string) => void;
}

const InicioPagina: FC<InicioPaginaProps> = ({ onVerDetalle }) => {
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const { eventos, cargando, error, recargar } = useEventos();
  const { user, profile } = useAuth();

  const eventosFiltrados: Evento[] =
    categoriaActiva === 'Todos'
      ? eventos
      : eventos.filter((e) => e.categoria === categoriaActiva);

  // Nombre para el saludo
  const nombreSaludo = profile?.username ?? null;

  return (
    <div className="flex-1 overflow-y-auto min-w-0">
      {/* Saludo */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-3xl font-bold text-white text-balance">
          {nombreSaludo ? `Hola, ${nombreSaludo} 👋` : 'Hola, Invitado 👋'}
        </h1>
        <p className="text-lavender text-sm mt-1">¿Qué pasa hoy en la UCV?</p>
      </div>

      {/* Filtros */}
      <FiltrosCategorias
        categoriaActiva={categoriaActiva}
        onCategoriaChange={setCategoriaActiva}
      />

      {/* Lista de eventos */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg text-balance">
            {titulos[categoriaActiva]}
          </h2>
          <button
            className="text-sm font-medium transition-colors active:opacity-70"
            style={{ color: '#d946ef' }}
          >
            Ver todos →
          </button>
        </div>

        {/* Estado: cargando */}
        {cargando && (
          <>
            <EventoCardSkeleton />
            <EventoCardSkeleton />
          </>
        )}

        {/* Estado: error */}
        {!cargando && error && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 rounded-2xl ucv-card-bg px-4 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Error al cargar</p>
              <p className="text-lavender text-xs mt-1">{error}</p>
            </div>
            <button
              onClick={recargar}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity active:opacity-70"
              style={{ background: 'linear-gradient(135deg, #d946ef, #a855f7)' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado: sin resultados */}
        {!cargando && !error && eventosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/>
                <path d="M21 21L16.65 16.65" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-lavender text-sm text-center">
              No hay eventos disponibles<br/>en esta categoría
            </p>
          </div>
        )}

        {/* Lista de eventos */}
        {!cargando && !error && eventosFiltrados.map((evento) => (
          <EventoCard key={evento.id} evento={evento} onClick={() => onVerDetalle(evento.id)} />
        ))}
      </div>

      {/* Botón flotante FAB para crear evento — solo para usuarios autenticados */}
      {user && (
        <button
          onClick={() => setFormularioAbierto(true)}
          className="fixed z-40 flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-white text-sm shadow-xl transition-all active:scale-95 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #d946ef, #a855f7)',
            bottom: '88px',
            right: '16px',
            boxShadow: '0 4px 20px rgba(217,70,239,0.5)',
          }}
          aria-label="Crear nuevo evento"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          Nuevo evento
        </button>
      )}

      {/* Modal de creación de evento */}
      <FormularioEvento
        abierto={formularioAbierto}
        onCerrar={() => setFormularioAbierto(false)}
        onExito={() => {
          recargar();
          setFormularioAbierto(false);
        }}
      />
    </div>
  );
};

export default InicioPagina;
