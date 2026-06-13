// Página Calendario - Cloud UCV con datos de Supabase
import { useState } from 'react';
import type { FC } from 'react';
import { useEventos } from '@/hooks/useEventos';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function generarDias(year: number, month: number): (number | null)[] {
  const primerDia = new Date(year, month, 1).getDay();
  const totalDias = new Date(year, month + 1, 0).getDate();
  const dias: (number | null)[] = [];
  for (let i = 0; i < primerDia; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(d);
  return dias;
}

const CalendarioPagina: FC = () => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const { eventos, cargando } = useEventos();

  // Extraer días con eventos del mes actual a partir de datos reales
  const diasConEventos = new Set(
    eventos
      .map((e) => {
        const partes = e.fecha.split(' ');
        return parseInt(partes[0]);
      })
      .filter((n) => !isNaN(n))
  );

  const dias = generarDias(anio, mes);

  const eventosDia = diaSeleccionado
    ? eventos.filter((e) => {
        const num = parseInt(e.fecha.split(' ')[0]);
        return num === diaSeleccionado;
      })
    : [];

  return (
    <div className="flex-1 overflow-y-auto min-w-0 px-4 py-5">
      <h2 className="text-white font-bold text-xl mb-4 text-balance">Calendario de Eventos</h2>

      {/* Navegación de mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMes((m) => (m === 0 ? 11 : m - 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-white font-semibold text-base">{meses[mes]} {anio}</span>
        <button
          onClick={() => setMes((m) => (m === 11 ? 0 : m + 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 mb-2">
        {diasSemana.map((d) => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-y-1 mb-6">
        {dias.map((dia, idx) => {
          if (dia === null) return <div key={`empty-${idx}`} />;
          const tieneEvento = !cargando && diasConEventos.has(dia);
          const seleccionado = diaSeleccionado === dia;
          const esHoy = dia === hoy.getDate() && mes === hoy.getMonth();

          return (
            <button
              key={dia}
              onClick={() => setDiaSeleccionado(seleccionado ? null : dia)}
              className="relative flex flex-col items-center justify-center h-10 rounded-xl transition-all active:scale-90"
              style={
                seleccionado
                  ? { background: 'linear-gradient(135deg, #d946ef, #a855f7)' }
                  : esHoy
                  ? { backgroundColor: 'rgba(255,255,255,0.15)' }
                  : {}
              }
            >
              <span
                className="text-sm font-medium"
                style={{ color: seleccionado ? '#fff' : esHoy ? '#fff' : 'rgba(255,255,255,0.85)' }}
              >
                {dia}
              </span>
              {tieneEvento && !seleccionado && (
                <div className="absolute bottom-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: '#d946ef' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Eventos del día seleccionado */}
      {diaSeleccionado && (
        <div>
          <h3 className="text-white font-semibold mb-3">
            Eventos para el {diaSeleccionado} de {meses[mes]}
          </h3>
          {cargando ? (
            <div className="flex justify-center py-6">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#d946ef', borderTopColor: 'transparent' }}
              />
            </div>
          ) : eventosDia.length > 0 ? (
            eventosDia.map((e) => (
              <div key={e.id} className="rounded-xl p-4 mb-3 ucv-card-bg flex gap-3 items-start">
                <div
                  className="w-1 rounded-full shrink-0 self-stretch"
                  style={{ background: 'linear-gradient(180deg, #d946ef, #a855f7)' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm truncate">{e.titulo}</p>
                  <p className="text-lavender text-xs mt-0.5">{e.hora} · {e.categoria}</p>
                  <p className="text-lavender text-xs mt-0.5">{e.asistentes} asistentes</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-lavender text-sm text-center py-4">Sin eventos este día</p>
          )}
        </div>
      )}

      {!diaSeleccionado && (
        <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-lavender text-sm">Selecciona un día para ver los eventos programados</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#d946ef' }} />
            <span className="text-xs text-lavender">Días con eventos</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioPagina;
