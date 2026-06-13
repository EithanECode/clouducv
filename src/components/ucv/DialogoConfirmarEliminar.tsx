// Diálogo de confirmación antes de eliminar un evento propio
import type { FC } from 'react';
import { useEliminarEvento } from '@/hooks/useEliminarEvento';

interface DialogoConfirmarEliminarProps {
  abierto: boolean;
  eventoId: string | null;
  eventoTitulo: string;
  onCerrar: () => void;
  onExito: () => void;
}

const DialogoConfirmarEliminar: FC<DialogoConfirmarEliminarProps> = ({
  abierto,
  eventoId,
  eventoTitulo,
  onCerrar,
  onExito,
}) => {
  const { eliminando, error, eliminarEvento, resetError } = useEliminarEvento();

  const handleEliminar = async () => {
    if (!eventoId) return;
    resetError();
    const ok = await eliminarEvento(eventoId);
    if (ok) {
      onExito();
      onCerrar();
    }
  };

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !eliminando) onCerrar(); }}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'hsl(258 62% 22%)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono de advertencia */}
        <div className="flex flex-col items-center pt-7 pb-4 px-6 gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Título */}
          <h3 className="text-white font-bold text-lg text-center text-balance">
            Eliminar Evento
          </h3>

          {/* Mensaje */}
          <p className="text-lavender text-sm text-center text-pretty leading-relaxed">
            ¿Estás seguro de que deseas eliminar el evento{' '}
            <span className="text-white font-semibold">&quot;{eventoTitulo}&quot;</span>?
            {' '}Esta acción no se puede deshacer.
          </p>

          {/* Error servidor */}
          {error && (
            <div
              className="w-full flex items-center gap-2.5 rounded-xl px-4 py-3 mt-1"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 20px' }} />

        {/* Botones */}
        <div className="flex gap-3 p-5">
          <button
            type="button"
            onClick={onCerrar}
            disabled={eliminando}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleEliminar}
            disabled={eliminando}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: eliminando ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            {eliminando ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 animate-spin shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.5)', borderTopColor: 'transparent' }}
                />
                Eliminando...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <polyline points="3 6 5 6 21 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogoConfirmarEliminar;
